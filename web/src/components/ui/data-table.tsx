import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Button } from './button';
import { QueryLoadingWrapper } from './loading-wrapper';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Interface Segregation Principle - Define specific interfaces for different concerns
export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_records: number;
}

export interface TableAction<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: (item: T) => boolean;
}

// Base table props
interface BaseDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  actions?: TableAction<T>[];
  className?: string;
  emptyMessage?: string;
}

// Props for table with query support
interface QueryDataTableProps<T> extends Omit<BaseDataTableProps<T>, 'data'> {
  query: {
    data?: any;
    isLoading: boolean;
    error: Error | null;
    refetch?: () => void;
  };
  dataExtractor?: (queryData: any) => T[];
  paginationExtractor?: (queryData: any) => PaginationInfo | null;
  onPageChange?: (page: number) => void;
}

// Generic value renderer following Open/Closed Principle
const renderCellValue = <T,>(
  column: Column<T>, 
  item: T, 
  index: number
): React.ReactNode => {
  if (column.render) {
    return column.render(getNestedValue(item, String(column.key)), item, index);
  }
  
  const value = getNestedValue(item, String(column.key));
  
  // Handle different value types
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }
  
  if (typeof value === 'boolean') {
    return <span className={value ? 'text-green-600' : 'text-red-600'}>
      {value ? 'Yes' : 'No'}
    </span>;
  }
  
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  
  return String(value);
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Action buttons component
interface ActionButtonsProps<T> {
  item: T;
  actions: TableAction<T>[];
}

const ActionButtons = <T,>({ item, actions }: ActionButtonsProps<T>) => {
  if (!actions.length) return null;
  
  return (
    <div className="flex gap-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outline'}
          size="sm"
          onClick={() => action.onClick(item)}
          disabled={action.disabled ? action.disabled(item) : false}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};

// Pagination component
interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { current_page, total_pages, total_records } = pagination;
  
  if (total_pages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {total_records} entries
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm">
          Page {current_page} of {total_pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= total_pages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Base DataTable component - Single Responsibility Principle
export const DataTable = <T,>({
  columns,
  data,
  keyExtractor = (_, index) => index,
  actions = [],
  className = '',
  emptyMessage = 'No data available'
}: BaseDataTableProps<T>) => {
  if (!data.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.label}
              </TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={keyExtractor(item, index)}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {renderCellValue(column, item, index)}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell className="text-right">
                  <ActionButtons item={item} actions={actions} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// QueryDataTable component with loading states and pagination
export const QueryDataTable = <T,>({
  query,
  columns,
  dataExtractor = (data) => data,
  paginationExtractor,
  onPageChange,
  keyExtractor,
  actions,
  className,
  emptyMessage
}: QueryDataTableProps<T>) => {
  return (
    <QueryLoadingWrapper
      query={query}
      isEmpty={(data) => {
        const extractedData = dataExtractor(data);
        return !Array.isArray(extractedData) || extractedData.length === 0;
      }}
      emptyMessage={emptyMessage}
      className={className}
    >
      {(queryData) => {
        const data = dataExtractor(queryData);
        const pagination = paginationExtractor?.(queryData);
        
        return (
          <div>
            <DataTable
              columns={columns}
              data={data}
              keyExtractor={keyExtractor}
              actions={actions}
              emptyMessage={emptyMessage}
            />
            {pagination && onPageChange && (
              <Pagination
                pagination={pagination}
                onPageChange={onPageChange}
              />
            )}
          </div>
        );
      }}
    </QueryLoadingWrapper>
  );
};
