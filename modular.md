# Modular Architecture Guide

This document outlines the modular architecture approach for building scalable, reusable, and maintainable applications in this platform. Implement this structure when developing your first or second app.

## Table of Contents
- [Overview](#overview)
- [Frontend Modularity](#frontend-modularity)
- [Backend Modularity](#backend-modularity)
- [Internal API Communication](#internal-api-communication)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

---

## Overview

The modular architecture follows these principles:
- **DRY (Don't Repeat Yourself)**: Reusable components and services
- **Separation of Concerns**: Clear boundaries between layers
- **Type Safety**: Shared TypeScript types across frontend
- **Scalability**: Easy to add new apps without duplication
- **Maintainability**: Fix bugs in one place, benefit everywhere

---

## Frontend Modularity

### Recommended Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── example-app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── app2/
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── ui/                    # Atomic UI components (existing)
│   │   ├── logo.tsx
│   │   └── button.tsx
│   ├── shared/                # NEW: Reusable app components
│   │   ├── AppHeader.tsx
│   │   ├── AppFooter.tsx
│   │   ├── DataCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   └── SuccessState.tsx
│   └── layouts/               # NEW: Reusable layouts
│       ├── AppLayout.tsx
│       ├── DashboardLayout.tsx
│       └── TwoColumnLayout.tsx
├── lib/
│   ├── api/                   # NEW: Modular API client
│   │   ├── client.ts          # Base axios instance
│   │   ├── base.ts            # Base API class
│   │   ├── types.ts           # Shared API types
│   │   └── apps/              # Per-app API modules
│   │       ├── example-app.ts
│   │       └── app2.ts
│   ├── hooks/                 # NEW: Reusable React hooks
│   │   ├── useAPI.ts
│   │   ├── useFetch.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── utils/                 # NEW: Shared utilities
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── types/                 # NEW: Shared TypeScript types
│       ├── common.ts
│       └── api.ts
└── styles/
    └── globals.css
```

### 1. Shared Components

Create reusable components that all apps can use:

**`components/shared/AppHeader.tsx`**
```typescript
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

interface AppHeaderProps {
  appName: string;
  showBackButton?: boolean;
}

export function AppHeader({ appName, showBackButton = true }: AppHeaderProps) {
  return (
    <header className="border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {showBackButton ? (
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-sm font-bold">BACK</span>
          </Link>
        ) : (
          <div className="w-20" />
        )}

        <div className="flex items-center gap-3">
          <Logo size={40} />
          <span className="text-xl font-bold tracking-tight">{appName}</span>
        </div>

        <div className="w-20" />
      </div>
    </header>
  );
}
```

**`components/shared/AppFooter.tsx`**
```typescript
import { Linkedin, Github, X } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="border-t-2 border-black mt-32">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-gray-600 font-mono">
            &copy; {new Date().getFullYear()} Darsh Joshi
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600 font-mono font-bold">
              OPEN FOR COLLABORATION!
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/darshjoshi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/darshjoshi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/darshjoshii"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center"
                aria-label="X (Twitter)"
              >
                <X className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

**`components/shared/DataCard.tsx`**
```typescript
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface DataCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: 'default' | 'success' | 'error';
}

export function DataCard({
  icon: Icon,
  title,
  description,
  children,
  variant = 'default'
}: DataCardProps) {
  const variantStyles = {
    default: 'border-black bg-white',
    success: 'border-green-600 bg-green-50',
    error: 'border-red-600 bg-red-50',
  };

  const titleStyles = {
    default: 'text-black',
    success: 'text-green-600',
    error: 'text-red-600',
  };

  return (
    <div className={`border-2 ${variantStyles[variant]} p-8 relative overflow-hidden group`}>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          {Icon && <Icon className={`w-6 h-6 ${titleStyles[variant]}`} />}
          <h3 className={`text-xl font-bold ${titleStyles[variant]}`}>{title}</h3>
        </div>

        {description && (
          <p className="text-gray-600 mb-6">{description}</p>
        )}

        {children}
      </div>

      {/* Corner accents */}
      <div className={`absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 ${variant === 'default' ? 'border-gray-300' : variantStyles[variant].split(' ')[0]}`} />
      <div className={`absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 ${variant === 'default' ? 'border-gray-300' : variantStyles[variant].split(' ')[0]}`} />
    </div>
  );
}
```

**`components/shared/LoadingState.tsx`**
```typescript
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-gray-600 mb-4" />
      <p className="text-gray-600 font-mono text-sm">{message}</p>
    </div>
  );
}
```

**`components/shared/ErrorState.tsx`**
```typescript
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="border-2 border-red-600 bg-red-50 p-8">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-red-600">Error Occurred</h3>
          <p className="text-red-700 font-mono text-sm mb-4">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm">
              TRY AGAIN
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**`components/shared/SuccessState.tsx`**
```typescript
import { CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';

interface SuccessStateProps {
  title?: string;
  children: ReactNode;
}

export function SuccessState({ title = 'Success', children }: SuccessStateProps) {
  return (
    <div className="border-2 border-green-600 bg-green-50 p-8">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle2 className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-green-600">{title}</h3>
      </div>
      {children}
    </div>
  );
}
```

### 2. Reusable Layouts

**`components/layouts/AppLayout.tsx`**
```typescript
import { ReactNode } from 'react';
import { AppHeader } from '@/components/shared/AppHeader';
import { AppFooter } from '@/components/shared/AppFooter';

interface AppLayoutProps {
  appName: string;
  children: ReactNode;
  showBackButton?: boolean;
}

export function AppLayout({ appName, children, showBackButton = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-black grid-bg">
      <AppHeader appName={appName} showBackButton={showBackButton} />
      <main className="max-w-5xl mx-auto px-6 py-20">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
```

### 3. Modular API Client

**`lib/api/client.ts`** (Enhanced version)
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (API_KEY) {
      config.headers['X-API-Key'] = API_KEY;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
```

**`lib/api/base.ts`**
```typescript
import api from './client';
import { AxiosResponse } from 'axios';

export class BaseAPI {
  constructor(protected endpoint: string) {}

  // Standard CRUD operations
  getAll = <T = any>(): Promise<AxiosResponse<T>> => {
    return api.get(`${this.endpoint}/data`);
  };

  getById = <T = any>(id: string | number): Promise<AxiosResponse<T>> => {
    return api.get(`${this.endpoint}/data/${id}`);
  };

  create = <T = any>(data: any): Promise<AxiosResponse<T>> => {
    return api.post(`${this.endpoint}/data`, data);
  };

  update = <T = any>(id: string | number, data: any): Promise<AxiosResponse<T>> => {
    return api.put(`${this.endpoint}/data/${id}`, data);
  };

  delete = <T = any>(id: string | number): Promise<AxiosResponse<T>> => {
    return api.delete(`${this.endpoint}/data/${id}`);
  };

  // Custom endpoint call
  call = <T = any>(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<AxiosResponse<T>> => {
    const endpoint = `${this.endpoint}${path}`;

    switch (method) {
      case 'GET':
        return api.get(endpoint);
      case 'POST':
        return api.post(endpoint, data);
      case 'PUT':
        return api.put(endpoint, data);
      case 'DELETE':
        return api.delete(endpoint);
      default:
        return api.get(endpoint);
    }
  };
}
```

**`lib/api/types.ts`**
```typescript
export interface APIResponse<T = any> {
  message: string;
  data: T;
}

export interface ErrorResponse {
  detail: string;
  status_code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  app: string;
}
```

**`lib/api/apps/example-app.ts`**
```typescript
import { BaseAPI } from '../base';
import { APIResponse } from '../types';

class ExampleAppAPI extends BaseAPI {
  constructor() {
    super('/example-app');
  }

  // Use inherited methods: getAll(), getById(), create(), update(), delete()

  // Add custom methods specific to this app
  getHealth = () => {
    return this.call<APIResponse>('/health', 'GET');
  };

  // Example custom method
  getSpecialData = (filter: string) => {
    return this.call<APIResponse>(`/special?filter=${filter}`, 'GET');
  };
}

export const exampleAppAPI = new ExampleAppAPI();
```

**`lib/api/apps/app2.ts`**
```typescript
import { BaseAPI } from '../base';
import { APIResponse } from '../types';

class App2API extends BaseAPI {
  constructor() {
    super('/app2');
  }

  // Custom methods for App 2
  getCombinedData = () => {
    return this.call<APIResponse>('/combined-data', 'GET');
  };
}

export const app2API = new App2API();
```

**`lib/api/index.ts`** (Central export)
```typescript
export { default as api } from './client';
export { BaseAPI } from './base';
export * from './types';

// Export all app APIs
export { exampleAppAPI } from './apps/example-app';
export { app2API } from './apps/app2';
```

### 4. Reusable React Hooks

**`lib/hooks/useAPI.ts`**
```typescript
import { useState, useCallback } from 'react';
import { AxiosResponse } from 'axios';

interface UseAPIReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useAPI<T = any>(
  apiCall: (...args: any[]) => Promise<AxiosResponse<T>>
): UseAPIReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(...args);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
```

**`lib/hooks/useFetch.ts`**
```typescript
import { useState, useEffect } from 'react';
import { AxiosResponse } from 'axios';

interface UseFetchOptions {
  autoFetch?: boolean;
  dependencies?: any[];
}

export function useFetch<T = any>(
  apiCall: () => Promise<AxiosResponse<T>>,
  options: UseFetchOptions = {}
) {
  const { autoFetch = true, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}
```

**`lib/hooks/useDebounce.ts`**
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**`lib/hooks/useLocalStorage.ts`**
```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

### 5. Example App Using Modular Components

**`app/app2/page.tsx`**
```typescript
'use client';

import { app2API } from '@/lib/api';
import { useAPI } from '@/lib/hooks/useAPI';
import { AppLayout } from '@/components/layouts/AppLayout';
import { DataCard } from '@/components/shared/DataCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SuccessState } from '@/components/shared/SuccessState';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function App2() {
  const { data, loading, error, execute } = useAPI(app2API.getAll);

  return (
    <AppLayout appName="APP 2">
      <section className="mb-16">
        <div className="inline-block mb-6 px-4 py-2 border-2 border-black text-sm font-mono font-bold">
          USING MODULAR COMPONENTS
        </div>
        <h1 className="text-6xl font-bold mb-6 leading-none tracking-tighter">
          App <span className="border-b-4 border-black">Two</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
          This app demonstrates the modular architecture with reusable components,
          hooks, and API clients.
        </p>
      </section>

      <DataCard
        icon={Zap}
        title="Fetch Data"
        description="Click the button to test the modular API client"
      >
        <Button onClick={execute} disabled={loading}>
          {loading ? 'LOADING...' : 'FETCH DATA'}
        </Button>
      </DataCard>

      {loading && (
        <section className="mt-8">
          <LoadingState message="Fetching data from API..." />
        </section>
      )}

      {error && (
        <section className="mt-8">
          <ErrorState message={error} onRetry={execute} />
        </section>
      )}

      {data && (
        <section className="mt-8">
          <SuccessState title="Data Retrieved">
            <div className="bg-white p-6 border-2 border-gray-300 overflow-x-auto">
              <pre className="text-sm font-mono text-green-700">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </SuccessState>
        </section>
      )}
    </AppLayout>
  );
}
```

---

## Backend Modularity

### Recommended Directory Structure

```
backend/
├── main.py
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── dependencies.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── example_app.py
│   │   │   └── app2.py
│   │   └── shared/          # NEW: Shared endpoints
│   │       ├── __init__.py
│   │       ├── health.py
│   │       └── common.py
│   ├── models/              # NEW: Database models
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── user.py
│   ├── schemas/             # NEW: Pydantic schemas
│   │   ├── __init__.py
│   │   ├── common.py
│   │   ├── responses.py
│   │   └── requests.py
│   ├── services/            # NEW: Business logic
│   │   ├── __init__.py
│   │   ├── base_service.py
│   │   ├── data_service.py
│   │   ├── cache_service.py
│   │   └── internal_api.py
│   └── utils/               # NEW: Utilities
│       ├── __init__.py
│       ├── formatters.py
│       └── validators.py
├── tests/
└── requirements.txt
```

### 1. Shared Schemas

**`app/schemas/common.py`**
```python
from pydantic import BaseModel
from typing import Optional, TypeVar, Generic
from datetime import datetime

# Generic response wrapper
T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    message: str
    data: Optional[T] = None
    timestamp: datetime = datetime.now()

class HealthCheck(BaseModel):
    status: str
    app: str
    timestamp: datetime = datetime.now()

class ErrorResponse(BaseModel):
    detail: str
    status_code: int
    timestamp: datetime = datetime.now()
```

**`app/schemas/responses.py`**
```python
from pydantic import BaseModel
from typing import List, Optional, Generic, TypeVar

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response for list endpoints"""
    items: List[T]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

class DataItem(BaseModel):
    """Example data schema"""
    id: int
    name: str
    status: str
    created_at: Optional[str] = None
```

### 2. Base Service Class

**`app/services/base_service.py`**
```python
from typing import Generic, TypeVar, Dict, Any, List, Optional
from abc import ABC, abstractmethod

T = TypeVar('T')

class BaseService(ABC, Generic[T]):
    """Base service class with common CRUD operations"""

    @abstractmethod
    async def get_all(self) -> List[T]:
        """Get all items"""
        pass

    @abstractmethod
    async def get_by_id(self, item_id: int) -> Optional[T]:
        """Get item by ID"""
        pass

    @abstractmethod
    async def create(self, data: Dict[str, Any]) -> T:
        """Create new item"""
        pass

    @abstractmethod
    async def update(self, item_id: int, data: Dict[str, Any]) -> Optional[T]:
        """Update existing item"""
        pass

    @abstractmethod
    async def delete(self, item_id: int) -> bool:
        """Delete item"""
        pass
```

**`app/services/data_service.py`**
```python
from typing import List, Optional, Dict, Any
from app.services.base_service import BaseService
from app.schemas.responses import DataItem

class DataService(BaseService[DataItem]):
    """Service for managing data items"""

    def __init__(self):
        # In-memory storage (replace with database later)
        self.items: List[DataItem] = []
        self.next_id = 1

    async def get_all(self) -> List[DataItem]:
        return self.items

    async def get_by_id(self, item_id: int) -> Optional[DataItem]:
        for item in self.items:
            if item.id == item_id:
                return item
        return None

    async def create(self, data: Dict[str, Any]) -> DataItem:
        item = DataItem(id=self.next_id, **data)
        self.items.append(item)
        self.next_id += 1
        return item

    async def update(self, item_id: int, data: Dict[str, Any]) -> Optional[DataItem]:
        for i, item in enumerate(self.items):
            if item.id == item_id:
                updated = DataItem(id=item_id, **data)
                self.items[i] = updated
                return updated
        return None

    async def delete(self, item_id: int) -> bool:
        for i, item in enumerate(self.items):
            if item.id == item_id:
                del self.items[i]
                return True
        return False

# Singleton instance
data_service = DataService()
```

### 3. Base Router Class

**`app/api/base_router.py`**
```python
from fastapi import APIRouter, HTTPException
from typing import Generic, TypeVar, Type, Dict, Any, List
from app.schemas.common import APIResponse
from app.services.base_service import BaseService

T = TypeVar('T')

class BaseCRUDRouter(Generic[T]):
    """Base router with standard CRUD endpoints"""

    def __init__(
        self,
        service: BaseService[T],
        prefix: str,
        tags: List[str],
        response_model: Type[T]
    ):
        self.service = service
        self.router = APIRouter(prefix=prefix, tags=tags)
        self.response_model = response_model
        self._register_routes()

    def _register_routes(self):
        """Register standard CRUD routes"""

        @self.router.get("/data", response_model=APIResponse[List[self.response_model]])
        async def get_all():
            items = await self.service.get_all()
            return APIResponse(message="Success", data=items)

        @self.router.get("/data/{item_id}", response_model=APIResponse[self.response_model])
        async def get_by_id(item_id: int):
            item = await self.service.get_by_id(item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            return APIResponse(message="Success", data=item)

        @self.router.post("/data", response_model=APIResponse[self.response_model])
        async def create(data: Dict[str, Any]):
            item = await self.service.create(data)
            return APIResponse(message="Created successfully", data=item)

        @self.router.put("/data/{item_id}", response_model=APIResponse[self.response_model])
        async def update(item_id: int, data: Dict[str, Any]):
            item = await self.service.update(item_id, data)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            return APIResponse(message="Updated successfully", data=item)

        @self.router.delete("/data/{item_id}", response_model=APIResponse[bool])
        async def delete(item_id: int):
            success = await self.service.delete(item_id)
            if not success:
                raise HTTPException(status_code=404, detail="Item not found")
            return APIResponse(message="Deleted successfully", data=True)
```

### 4. App-Specific Router Using Base

**`app/api/routes/app2.py`**
```python
from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.dependencies import verify_api_key
from app.schemas.common import APIResponse
from app.schemas.responses import DataItem
from app.services.data_service import data_service

# Create router
router = APIRouter(
    prefix="/app2",
    tags=["app2"],
    dependencies=[Depends(verify_api_key)]
)

# Use the shared data service with custom endpoints

@router.get("/data", response_model=APIResponse)
async def get_data():
    """Get all data"""
    items = await data_service.get_all()
    return APIResponse(
        message="Data retrieved successfully",
        data={"items": items, "count": len(items)}
    )

@router.post("/data", response_model=APIResponse)
async def create_data(data: Dict[str, Any]):
    """Create new data"""
    item = await data_service.create(data)
    return APIResponse(message="Created successfully", data=item)

@router.get("/health")
async def health_check():
    """Health check for App 2"""
    return {"status": "healthy", "app": "app2"}

# Custom endpoint specific to App 2
@router.get("/combined-data")
async def get_combined_data():
    """Get combined data from multiple sources"""
    # This can call other services or internal APIs
    app2_data = await data_service.get_all()

    return APIResponse(
        message="Combined data retrieved",
        data={
            "app2_data": app2_data,
            "metadata": {"source": "app2", "version": "1.0"}
        }
    )
```

### 5. Shared Utilities

**`app/utils/formatters.py`**
```python
from datetime import datetime
from typing import Any, Dict

def format_datetime(dt: datetime) -> str:
    """Format datetime to ISO string"""
    return dt.isoformat()

def format_response(message: str, data: Any = None) -> Dict[str, Any]:
    """Format standard API response"""
    return {
        "message": message,
        "data": data,
        "timestamp": format_datetime(datetime.now())
    }

def sanitize_input(input_str: str) -> str:
    """Sanitize user input"""
    return input_str.strip().lower()
```

**`app/utils/validators.py`**
```python
import re
from typing import Optional

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_url(url: str) -> bool:
    """Validate URL format"""
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return bool(re.match(pattern, url))

def validate_required_fields(data: dict, required_fields: list) -> Optional[str]:
    """Validate required fields are present"""
    missing = [field for field in required_fields if field not in data]
    if missing:
        return f"Missing required fields: {', '.join(missing)}"
    return None
```

---

## Internal API Communication

### App-to-App Communication Pattern

**`app/services/internal_api.py`**
```python
from typing import Dict, Any, Optional
from app.services.data_service import data_service

class InternalAPIService:
    """Service for internal app-to-app communication"""

    def __init__(self):
        # Register available services
        self.services = {
            "data": data_service,
            # Add more services as needed
        }

    async def call_service(
        self,
        service_name: str,
        method: str,
        *args,
        **kwargs
    ) -> Any:
        """
        Call another service internally without HTTP overhead

        Args:
            service_name: Name of the service to call
            method: Method name to execute
            *args, **kwargs: Arguments to pass to the method

        Returns:
            Result from the service method
        """
        service = self.services.get(service_name)
        if not service:
            raise ValueError(f"Service '{service_name}' not found")

        method_fn = getattr(service, method, None)
        if not method_fn:
            raise ValueError(f"Method '{method}' not found in service '{service_name}'")

        return await method_fn(*args, **kwargs)

    async def get_data_from_service(self, service_name: str, data_id: Optional[int] = None) -> Any:
        """Helper to get data from another service"""
        if data_id:
            return await self.call_service(service_name, "get_by_id", data_id)
        return await self.call_service(service_name, "get_all")

# Singleton instance
internal_api = InternalAPIService()
```

### Using Internal API

**Example in `app/api/routes/app2.py`:**
```python
from app.services.internal_api import internal_api

@router.get("/combined-data")
async def get_combined_data():
    """Get data from multiple internal services"""

    # Call data service internally (no HTTP overhead)
    all_data = await internal_api.call_service("data", "get_all")

    # Combine with App 2's own data
    app2_specific = {
        "app": "app2",
        "version": "1.0",
        "features": ["feature1", "feature2"]
    }

    return {
        "message": "Combined data from multiple sources",
        "data": {
            "shared_data": all_data,
            "app2_data": app2_specific
        }
    }
```

---

## Migration Guide

### Step 1: Create Shared Components (Frontend)

1. Create the directory structure:
```bash
mkdir -p frontend/components/shared
mkdir -p frontend/components/layouts
mkdir -p frontend/lib/api/apps
mkdir -p frontend/lib/hooks
mkdir -p frontend/lib/utils
mkdir -p frontend/lib/types
```

2. Copy the shared component code from this document into respective files

3. Update existing apps to use shared components:
   - Replace custom headers with `<AppHeader>`
   - Replace custom footers with `<AppFooter>`
   - Wrap pages in `<AppLayout>`

### Step 2: Refactor API Client (Frontend)

1. Create `lib/api/base.ts` with `BaseAPI` class
2. Create `lib/api/types.ts` with shared types
3. Refactor existing API clients to extend `BaseAPI`
4. Create `lib/api/index.ts` to centralize exports

**Example migration:**
```typescript
// Before (lib/api.ts)
export const exampleAppAPI = {
  getData: () => api.get('/example-app/data'),
};

// After (lib/api/apps/example-app.ts)
import { BaseAPI } from '../base';

class ExampleAppAPI extends BaseAPI {
  constructor() {
    super('/example-app');
  }
}

export const exampleAppAPI = new ExampleAppAPI();
```

### Step 3: Add Reusable Hooks (Frontend)

1. Create hook files in `lib/hooks/`
2. Update existing components to use hooks
3. Test each hook thoroughly

**Example migration:**
```typescript
// Before
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const fetchData = async () => {
  setLoading(true);
  const response = await exampleAppAPI.getData();
  setData(response.data);
  setLoading(false);
};

// After
const { data, loading, execute: fetchData } = useAPI(exampleAppAPI.getAll);
```

### Step 4: Create Backend Services

1. Create directory structure:
```bash
mkdir -p backend/app/services
mkdir -p backend/app/schemas
mkdir -p backend/app/utils
```

2. Create base service class
3. Create shared schemas
4. Refactor existing routes to use services

### Step 5: Implement Internal API

1. Create `app/services/internal_api.py`
2. Register all services
3. Update routes to use internal API for cross-app calls

---

## Best Practices

### 1. Component Reusability
- Keep components small and focused (Single Responsibility)
- Use composition over inheritance
- Accept props for customization
- Document component props with TypeScript interfaces

### 2. API Client Organization
- One API class per app
- Extend `BaseAPI` for standard CRUD operations
- Add custom methods as needed
- Use TypeScript generics for type safety

### 3. Hook Usage
- Keep hooks simple and focused
- Return consistent data structures
- Handle loading and error states
- Use `useCallback` and `useMemo` for optimization

### 4. Service Layer
- Keep business logic in services, not routes
- Use dependency injection for testability
- Services should be stateless when possible
- Use internal API for cross-service communication

### 5. Error Handling
- Use consistent error response format
- Handle errors at appropriate layers
- Log errors for debugging
- Provide user-friendly error messages

### 6. Type Safety
- Define shared types in `lib/types/`
- Use Pydantic models for validation
- Leverage TypeScript generics
- Avoid `any` types when possible

### 7. Testing
- Test shared components in isolation
- Mock API calls in component tests
- Test services independently from routes
- Write integration tests for critical flows

### 8. Performance
- Use React hooks for optimization (`useMemo`, `useCallback`)
- Implement caching in services
- Use pagination for large datasets
- Lazy load components when appropriate

---

## Example: Building a New App with Modular Architecture

### Step-by-step: Creating "App 3"

**1. Backend Route (`backend/app/api/routes/app3.py`)**
```python
from fastapi import APIRouter, Depends
from app.dependencies import verify_api_key
from app.schemas.common import APIResponse
from app.services.data_service import data_service

router = APIRouter(
    prefix="/app3",
    tags=["app3"],
    dependencies=[Depends(verify_api_key)]
)

@router.get("/data")
async def get_data():
    items = await data_service.get_all()
    return APIResponse(message="Success", data=items)

@router.get("/health")
async def health_check():
    return {"status": "healthy", "app": "app3"}
```

**2. Register in `backend/main.py`**
```python
from app.api.routes import example_app, app2, app3

app.include_router(app3.router, prefix=settings.API_V1_STR)
```

**3. Frontend API Client (`frontend/lib/api/apps/app3.ts`)**
```typescript
import { BaseAPI } from '../base';

class App3API extends BaseAPI {
  constructor() {
    super('/app3');
  }

  getHealth = () => this.call('/health', 'GET');
}

export const app3API = new App3API();
```

**4. Export in `frontend/lib/api/index.ts`**
```typescript
export { app3API } from './apps/app3';
```

**5. Frontend Page (`frontend/app/app3/page.tsx`)**
```typescript
'use client';

import { app3API } from '@/lib/api';
import { useAPI } from '@/lib/hooks/useAPI';
import { AppLayout } from '@/components/layouts/AppLayout';
import { DataCard } from '@/components/shared/DataCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SuccessState } from '@/components/shared/SuccessState';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function App3() {
  const { data, loading, error, execute } = useAPI(app3API.getAll);

  return (
    <AppLayout appName="APP 3">
      <h1 className="text-6xl font-bold mb-6">App Three</h1>

      <DataCard icon={Zap} title="Fetch Data">
        <Button onClick={execute} disabled={loading}>
          FETCH DATA
        </Button>
      </DataCard>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={execute} />}
      {data && (
        <SuccessState>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </SuccessState>
      )}
    </AppLayout>
  );
}
```

**6. Frontend Layout (`frontend/app/app3/layout.tsx`)**
```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App 3 | Apps Dashboard",
  description: "Description of App 3",
  // ... OpenGraph metadata
};

export default function App3Layout({ children }: { children: React.ReactNode }) {
  return children;
}
```

**7. Add to Homepage (`frontend/app/page.tsx`)**
```typescript
{
  id: 'app3',
  name: 'App 3',
  description: 'Your app description',
  href: '/app3',
  status: 'active',
}
```

That's it! The new app is fully integrated with minimal code duplication.

---

## Conclusion

This modular architecture provides:
- **Faster development**: Reuse components and patterns
- **Consistency**: All apps look and behave similarly
- **Maintainability**: Fix bugs once, benefit everywhere
- **Scalability**: Easy to add new apps
- **Type Safety**: TypeScript + Pydantic
- **Best Practices**: Clean architecture patterns

Start implementing this structure with your first or second app, and iteratively improve as you build more applications.

For questions or improvements, update this document as the platform evolves.
