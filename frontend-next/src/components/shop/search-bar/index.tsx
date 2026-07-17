/**
 * @file src/components/shop/search-bar/index.tsx
 */

import { SearchIcon } from "@/components/icons";
import { Button, Input } from "@/components/ui";

import styles from "./styles.module.css";

interface SearchBarProps {
  /** The current ?q= value, so the input shows what's already searched. */
  defaultValue?: string;
}

export default function SearchBar({ defaultValue }: SearchBarProps) {
  return (
    <form action="/products" method="GET" role="search" className={styles.form}>
      <div className={styles.inputWrapper}>
        <Input
          leftElement={<SearchIcon size={18} aria-hidden="true" />}
          placeholder="Search products..."
          aria-label="Search products"
          defaultValue={defaultValue}
          type="search"
          name="q"
        />
      </div>

      <Button type="submit">Search</Button>
    </form>
  );
}
