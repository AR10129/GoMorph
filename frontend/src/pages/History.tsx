import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { api, ConversionHistory } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, User } from 'lucide-react';

const PAGE_SIZE = 10;

const statusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'processing':
      return 'secondary';
    default:
      return 'outline';
  }
};

type HistoryStats = {
  total_conversions: number;
  total_data_size_mb: number;
  format_breakdown: Record<string, number>;
  recent_activity: {
    id: string;
    input_format: string;
    output_format: string;
    converted_at: string;
    status: string;
  }[];
};

const History = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout, userEmail, username } = useAuth();
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed' | 'processing' | 'queued'>('all');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount]);
  const currentPage = useMemo(() => Math.floor(offset / PAGE_SIZE) + 1, [offset]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    let isActive = true;
    const loadHistory = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.getHistory({
          limit: PAGE_SIZE,
          offset,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });
        if (!isActive) return;
        setHistory(response.history);
        setTotalCount(response.total_count);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadHistory();
    return () => {
      isActive = false;
    };
  }, [isLoggedIn, navigate, offset, statusFilter]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let isActive = true;
    const loadStats = async () => {
      try {
        const data = await api.getHistoryStats();
        if (isActive) setStats(data);
      } catch {
        if (isActive) setStats(null);
      }
    };
    loadStats();
    return () => {
      isActive = false;
    };
  }, [isLoggedIn]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar onGetStarted={() => {}} onSignIn={() => {}} isLoggedIn={isLoggedIn} />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Conversion History</h1>
              <p className="text-muted-foreground">Track your recent conversions</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>Back to Dashboard</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{username || userEmail}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Conversions</p>
                <p className="text-3xl font-semibold mt-2">{stats?.total_conversions ?? totalCount}</p>
                <p className="text-sm text-muted-foreground mt-1">Lifetime processed jobs</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Data Processed</p>
                <p className="text-3xl font-semibold mt-2">
                  {stats ? `${stats.total_data_size_mb.toFixed(2)} MB` : '—'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Across all conversions</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Filter Status</p>
              <div className="mt-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="capitalize">{statusFilter}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {(['all', 'completed', 'failed', 'processing', 'queued'] as const).map(status => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => {
                          setOffset(0);
                          setStatusFilter(status);
                        }}
                      >
                        <span className="capitalize">{status}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Input</TableHead>
                  <TableHead>Output</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Converted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Loading history...
                    </TableCell>
                  </TableRow>
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No history yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.input_format}</TableCell>
                      <TableCell>{item.output_format}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.file_size_bytes ? `${(item.file_size_bytes / (1024 * 1024)).toFixed(2)} MB` : '—'}
                      </TableCell>
                      <TableCell>
                        {item.converted_at ? new Date(item.converted_at).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default History;
