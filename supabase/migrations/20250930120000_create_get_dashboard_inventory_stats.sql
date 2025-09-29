-- Create a consolidated dashboard inventory stats RPC for lightweight widgets
create or replace function public.get_dashboard_inventory_stats(limit_commodities integer default 6)
returns table (
  today_received numeric,
  today_issued numeric,
  total_stock numeric,
  critical_items bigint,
  low_stock_items bigint,
  stock_ok bigint,
  stock_low bigint,
  stock_out bigint,
  commodity_statuses jsonb
)
language sql
security invoker
set search_path = public
as $$
with user_facilities as (
  select ufm.facility_id
  from public.user_facility_memberships ufm
  where ufm.user_id = auth.uid()
    and ufm.status = 'approved'
),
authorized_transactions as (
  select t.*
  from public.inventory_transactions t
  where (
    has_role(auth.uid(), 'admin'::app_role)
    or has_role(auth.uid(), 'analyst'::app_role)
    or exists (
      select 1
      from user_facilities uf
      where uf.facility_id = t.facility_id
    )
  )
),
today_metrics as (
  select
    coalesce(sum(case when t.transaction_type = 'receipt' then t.quantity else 0 end), 0) as today_received,
    coalesce(sum(case when t.transaction_type = 'issue' then t.quantity else 0 end), 0) as today_issued
  from authorized_transactions t
  where t.transaction_date = current_date
),
authorized_balances as (
  select
    b.*,
    p.name as product_name
  from public.inventory_balances b
  left join public.products p on p.id = b.product_id
  where (
    has_role(auth.uid(), 'admin'::app_role)
    or has_role(auth.uid(), 'analyst'::app_role)
    or exists (
      select 1
      from user_facilities uf
      where uf.facility_id = b.facility_id
    )
  )
),
balance_metrics as (
  select
    coalesce(sum(b.current_stock), 0) as total_stock,
    count(*) filter (where coalesce(b.current_stock, 0) <= coalesce(b.reorder_level, 0)) as critical_items,
    count(*) filter (
      where coalesce(b.current_stock, 0) > coalesce(b.reorder_level, 0)
        and coalesce(b.current_stock, 0) <= coalesce(b.minimum_stock_level, 0) * 1.2
    ) as low_stock_items,
    count(*) filter (where coalesce(b.current_stock, 0) > coalesce(b.reorder_level, 0)) as stock_ok,
    count(*) filter (
      where coalesce(b.current_stock, 0) > 0
        and coalesce(b.current_stock, 0) <= coalesce(b.reorder_level, 0)
        and coalesce(b.current_stock, 0) > coalesce(b.minimum_stock_level, 0) * 0.5
    ) as stock_low,
    count(*) filter (where coalesce(b.current_stock, 0) = 0) as stock_out
  from authorized_balances b
),
commodity_rollup as (
  select
    product_name,
    coalesce(sum(b.current_stock), 0) as total_stock,
    count(*) as facilities,
    count(*) filter (where coalesce(b.current_stock, 0) = 0) as stockouts,
    count(*) filter (
      where coalesce(b.current_stock, 0) > 0
        and coalesce(b.current_stock, 0) <= coalesce(b.reorder_level, 0)
    ) as low_stock
  from authorized_balances b
  where product_name is not null
  group by product_name
),
commodity_ranked as (
  select
    cr.*, 
    case when facilities > 0 then stockouts::numeric / facilities::numeric else 0 end as stockout_rate,
    case when facilities > 0 then low_stock::numeric / facilities::numeric else 0 end as low_stock_rate,
    case when facilities > 0 then floor((total_stock / facilities) / 10) else 0 end as avg_days_of_stock
  from commodity_rollup cr
),
commodity_limited as (
  select
    product_name,
    total_stock,
    facilities,
    stockouts,
    low_stock,
    stockout_rate,
    low_stock_rate,
    avg_days_of_stock,
    case
      when stockout_rate > 0.2 then 'critical'
      when low_stock_rate > 0.3 then 'warning'
      else 'ok'
    end as status,
    case
      when stockout_rate > 0.2 then 'critical'
      when low_stock_rate > 0.3 then 'declining'
      else 'stable'
    end as trend
  from commodity_ranked
  order by stockout_rate desc, low_stock_rate desc, total_stock desc
  limit greatest(limit_commodities, 0)
)
select
  (select today_received from today_metrics) as today_received,
  (select today_issued from today_metrics) as today_issued,
  (select total_stock from balance_metrics) as total_stock,
  (select critical_items from balance_metrics) as critical_items,
  (select low_stock_items from balance_metrics) as low_stock_items,
  (select stock_ok from balance_metrics) as stock_ok,
  (select stock_low from balance_metrics) as stock_low,
  (select stock_out from balance_metrics) as stock_out,
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'name', product_name,
          'status', status,
          'trend', trend,
          'avg_days_of_stock', avg_days_of_stock,
          'total_stock', total_stock,
          'facilities', facilities,
          'stockouts', stockouts,
          'low_stock', low_stock
        )
      )
      from commodity_limited
    ),
    '[]'::jsonb
  ) as commodity_statuses;
$$;

grant execute on function public.get_dashboard_inventory_stats(integer) to authenticated;
