import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CheckCircle2, XCircle, Info, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AISuggestion {
  id: string;
  store_id: string | null;
  title: string;
  description: string | null;
  rationale: string | null;
  status: string;
  created_at: string;
}

interface TaskSuggestion {
  title: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  rationale: string;
}

const AISuggestions = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { isHQAdmin, loading: roleLoading } = useUserRole(user?.id);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [stores, setStores] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isHQAdmin) {
      fetchStores();
      fetchSuggestions();
    }
  }, [isHQAdmin]);

  const fetchStores = async () => {
    const { data } = await supabase.from('stores').select('*').order('name');
    setStores(data || []);
    if (data && data.length > 0) {
      setSelectedStore(data[0].id);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!selectedStore) {
      toast.error(t('errors.selectStore'));
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-task-suggestions', {
        body: { storeId: selectedStore, type: 'suggest', limit: 5 }
      });

      if (error) throw error;

      toast.success(t('success.suggestionsGenerated', { count: data.length }));
      await fetchSuggestions();
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error(t('errors.failedToGenerateSuggestions'));
    } finally {
      setGenerating(false);
    }
  };

  const approveSuggestion = async (suggestionId: string, suggestion: AISuggestion) => {
    try {
      // Create task from suggestion
      const { error: taskError } = await supabase.from('tasks').insert({
        store_id: suggestion.store_id,
        title: suggestion.title,
        description: suggestion.description,
        priority: 'medium',
        status: 'not_started',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      if (taskError) throw taskError;

      // Update suggestion status
      const { error: updateError } = await supabase
        .from('ai_suggestions')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', suggestionId);

      if (updateError) throw updateError;

      toast.success(t('success.suggestionApproved'));
      await fetchSuggestions();
    } catch (error) {
      console.error('Error approving suggestion:', error);
      toast.error(t('errors.failedToApproveSuggestion'));
    }
  };

  const rejectSuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ status: 'rejected' })
        .eq('id', suggestionId);

      if (error) throw error;

      toast.success(t('success.suggestionRejected'));
      await fetchSuggestions();
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      toast.error(t('errors.failedToRejectSuggestion'));
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isHQAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t('taskTemplates.accessRestricted')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('aiSuggestions.aiOnly')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const approvedSuggestions = suggestions.filter(s => s.status === 'approved');
  const rejectedSuggestions = suggestions.filter(s => s.status === 'rejected');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              {t('aiSuggestions.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('aiSuggestions.subtitle')}
            </p>
          </div>

          <div className="flex gap-3">
            <select
              className="px-4 py-2 border rounded-lg"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>

            <Button onClick={generateSuggestions} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('aiSuggestions.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('aiSuggestions.generateSuggestions')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{pendingSuggestions.length}</div>
              <p className="text-sm text-muted-foreground">{t('aiSuggestions.pendingReview')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">{approvedSuggestions.length}</div>
              <p className="text-sm text-muted-foreground">{t('aiSuggestions.approved')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-muted-foreground">{rejectedSuggestions.length}</div>
              <p className="text-sm text-muted-foreground">{t('aiSuggestions.rejected')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Suggestions */}
        {pendingSuggestions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('aiSuggestions.pendingSuggestions')}</h2>
            <div className="space-y-4">
              {pendingSuggestions.map(suggestion => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                        {suggestion.description && (
                          <CardDescription className="mt-1">
                            {suggestion.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Rationale */}
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">{t('aiSuggestions.whySuggested')}</p>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.rationale || t('aiSuggestions.basedOnPatterns')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveSuggestion(suggestion.id, suggestion)}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t('aiSuggestions.approveAndCreate')}
                      </Button>
                      <Button
                        onClick={() => rejectSuggestion(suggestion.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('aiSuggestions.reject')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {pendingSuggestions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t('aiSuggestions.noSuggestions')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AISuggestions;
