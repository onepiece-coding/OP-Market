/**
 * @file src/app/admin/orders/status-filter.tsx
 */

import { ORDER_STATUS_LABELS } from "@/lib/utils/orderStatus";
import type { OrderStatus } from "@/types";
import { Button } from "@/components/ui";

import styles from "./status-filter.module.css";

interface StatusFilterProps {
  currentStatus?: OrderStatus;
}

const ALL_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default function StatusFilter({ currentStatus }: StatusFilterProps) {
  return (
    <form action="/admin/orders" method="GET" className={styles.form}>
      <select
        defaultValue={currentStatus ?? ""}
        className={styles.select}
        name="status"
      >
        <option value="">All Statuses</option>
        {ALL_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ORDER_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm">
        Filter
      </Button>
    </form>
  );
}
