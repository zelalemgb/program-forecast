-- Create the missing dashboard inventory stats function
CREATE OR REPLACE FUNCTION get_dashboard_inventory_stats(limit_commodities INTEGER DEFAULT 10)
RETURNS TABLE (
  today_received BIGINT,
  today_issued BIGINT,
  total_stock NUMERIC,
  critical_items BIGINT,
  low_stock_items BIGINT,
  stock_ok BIGINT,
  stock_low BIGINT,
  stock_out BIGINT,
  commodity_statuses JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH today_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE transaction_type = 'receipt' AND transaction_date = CURRENT_DATE) as received,
      COUNT(*) FILTER (WHERE transaction_type = 'issue' AND transaction_date = CURRENT_DATE) as issued
    FROM inventory_transactions
  ),
  stock_levels AS (
    SELECT 
      COUNT(*) FILTER (WHERE current_stock <= 0) as stockout,
      COUNT(*) FILTER (WHERE current_stock > 0 AND current_stock <= reorder_level) as low,
      COUNT(*) FILTER (WHERE current_stock > reorder_level) as ok,
      SUM(current_stock) as total
    FROM inventory_balances
  ),
  top_commodities AS (
    SELECT 
      pr.canonical_name as name,
      CASE 
        WHEN ib.current_stock <= 0 THEN 'critical'
        WHEN ib.current_stock <= ib.reorder_level THEN 'warning'
        ELSE 'ok'
      END as status,
      CASE
        WHEN ib.current_stock <= 0 THEN 'critical'
        WHEN ib.average_monthly_consumption > 0 AND ib.current_stock / ib.average_monthly_consumption < 30 THEN 'declining'
        ELSE 'stable'
      END as trend,
      CASE 
        WHEN ib.average_monthly_consumption > 0 THEN (ib.current_stock / ib.average_monthly_consumption * 30)
        ELSE 0
      END as avg_days_of_stock
    FROM inventory_balances ib
    JOIN product_reference pr ON pr.id = ib.product_id
    WHERE ib.current_stock IS NOT NULL
    ORDER BY 
      CASE 
        WHEN ib.current_stock <= 0 THEN 1
        WHEN ib.current_stock <= ib.reorder_level THEN 2
        ELSE 3
      END,
      ib.current_stock ASC
    LIMIT limit_commodities
  )
  SELECT 
    ts.received::BIGINT,
    ts.issued::BIGINT,
    sl.total,
    (sl.stockout + sl.low)::BIGINT as critical_items,
    sl.low::BIGINT,
    sl.ok::BIGINT,
    sl.low::BIGINT,
    sl.stockout::BIGINT,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', tc.name,
          'status', tc.status,
          'trend', tc.trend,
          'avg_days_of_stock', tc.avg_days_of_stock
        )
      )
      FROM top_commodities tc
    ) as commodity_statuses
  FROM today_stats ts, stock_levels sl;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;