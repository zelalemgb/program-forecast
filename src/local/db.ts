import Dexie, { Table } from "dexie";

export interface Item {
  id: string; // uuid from server when synced
  code?: string;
  canonical_name: string;
  strength?: string;
  form?: string;
  pack_size?: number;
  uom?: string;
  program?: string;
  tracer_flag?: boolean;
  gtin?: string;
  barcode_type?: string;
  active?: boolean;
  effective_from?: string; // ISO date
  effective_to?: string | null;
  updated_at?: string;
}

export interface Batch {
  id?: number; // local key
  item_id: string; // Item.id
  lot: string;
  expiry_date: string; // ISO date
  manufacturer?: string;
  updated_at?: string;
}

export interface StockBalance {
  id?: number; // local key
  facility_id: number;
  store_id?: string;
  item_id: string;
  batch_id?: number;
  soh_qty: number;
  last_txn_dt?: string;
}

export type TxnType =
  | "receipt"
  | "issue"
  | "return"
  | "transfer"
  | "adjustment+"
  | "adjustment-"
  | "loss"
  | "discard";

export interface TransactionRow {
  id?: number;
  txn_id?: string; // server id when synced
  type: TxnType;
  item_id: string;
  batch_id?: number;
  qty: number;
  uom?: string;
  reason?: string;
  src?: string;
  dest?: string;
  doc_ref?: string;
  txn_dt: string; // ISO date
  user_id?: string;
  fefo_overridden?: boolean;
  override_reason?: string;
  created_at?: string;
}

export interface RrfHeaderLocal {
  id?: number;
  rrf_id?: string; // server id
  facility_id: number;
  program_id: string;
  period: string; // YYYY-MM
  status: string; // draft/validated/approved/submitted
  created_at?: string;
  updated_at?: string;
}

export interface RrfLineLocal {
  id?: number;
  rrf_local_id: number; // link to local header
  item_id: string;
  soh?: number;
  amc?: number;
  pipeline?: number;
  suggested_order?: number;
  final_order?: number;
  comments?: string;
}

export interface SyncQueueItem {
  id?: number;
  kind: "transaction" | "rrf" | "master";
  payload: any;
  created_at: number;
  retries: number;
}

class LocalDB extends Dexie {
  items!: Table<Item, string>;
  batches!: Table<Batch, number>;
  stockBalances!: Table<StockBalance, number>;
  transactions!: Table<TransactionRow, number>;
  rrfHeaders!: Table<RrfHeaderLocal, number>;
  rrfLines!: Table<RrfLineLocal, number>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super("dagu-local-db");

    this.version(1).stores({
      items: "id, code, canonical_name, gtin, program, active",
      batches: "++id, item_id, lot, expiry_date",
      stockBalances: "++id, facility_id, item_id, batch_id",
      transactions: "++id, txn_dt, item_id, type",
      rrfHeaders: "++id, period, program_id, facility_id, status",
      rrfLines: "++id, rrf_local_id, item_id",
      syncQueue: "++id, kind, created_at",
    });
  }
}

export const db = new LocalDB();
