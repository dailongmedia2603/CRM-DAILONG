import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, Personnel } from '@/types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export type TimeRange = 'all' | 'month' | 'week' | 'today';

export interface SalesReportData {
  salesPersonId: string;
  salesPersonName: string;
  totalLeads: number;
  potential: number;
  notPotential: number;
  undeterminedPotential: number;
  working: number;
  thinking: number;
  silent: number;
  rejectedStatus: number;
  signedContract: number;
  undecided: number;
  rejectedResult: number;
  inDiscussion: number;
  conversionRate: number;
  currentOverdue: number;
  historicalLapses: number;
}

export const useSalesReportData = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesPersonnel, setSalesPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [leadsRes, personnelRes] = await Promise.all([
        supabase.from('leads').select('*, lead_history(*)'),
        supabase.from('personnel').select('*').eq('position', 'Sale'),
      ]);

      if (leadsRes.data) setLeads(leadsRes.data as any[]);
      if (personnelRes.data) setSalesPersonnel(personnelRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const processedData = useMemo((): SalesReportData[] => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (timeRange) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
    }

    const filteredLeads = leads.filter(lead => {
      if (!startDate || !endDate) return true;
      const createdAt = parseISO(lead.created_at);
      return createdAt >= startDate && createdAt <= endDate;
    });

    const reportMap = new Map<string, SalesReportData>();

    salesPersonnel.forEach(sp => {
      reportMap.set(sp.id, {
        salesPersonId: sp.id,
        salesPersonName: sp.name,
        totalLeads: 0,
        potential: 0,
        notPotential: 0,
        undeterminedPotential: 0,
        working: 0,
        thinking: 0,
        silent: 0,
        rejectedStatus: 0,
        signedContract: 0,
        undecided: 0,
        rejectedResult: 0,
        inDiscussion: 0,
        conversionRate: 0,
        currentOverdue: 0,
        historicalLapses: 0,
      });
    });

    filteredLeads.forEach(lead => {
      if (!lead.created_by_id || !reportMap.has(lead.created_by_id)) return;

      const data = reportMap.get(lead.created_by_id)!;
      data.totalLeads++;

      // Potential
      if (lead.potential === 'tiềm năng') data.potential++;
      else if (lead.potential === 'không tiềm năng') data.notPotential++;
      else data.undeterminedPotential++;

      // Status
      if (lead.status === 'đang làm việc') data.working++;
      else if (lead.status === 'đang suy nghĩ') data.thinking++;
      else if (lead.status === 'im ru') data.silent++;
      else if (lead.status === 'từ chối') data.rejectedStatus++;

      // Result
      if (lead.result === 'ký hợp đồng') data.signedContract++;
      else if (lead.result === 'chưa quyết định') data.undecided++;
      else if (lead.result === 'từ chối') data.rejectedResult++;
      else if (lead.result === 'đang trao đổi') data.inDiscussion++;

      // Metric A: Current Overdue
      const sortedHistory = [...(lead.lead_history || [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
      const latestHistory = sortedHistory[0];
      if (latestHistory?.next_follow_up_date && parseISO(latestHistory.next_follow_up_date) < now && lead.result !== 'ký hợp đồng' && lead.result !== 'từ chối') {
        data.currentOverdue++;
      }

      // Metric B: Historical Lapses
      const historyAsc = [...(lead.lead_history || [])].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
      for (let i = 0; i < historyAsc.length - 1; i++) {
        const current = historyAsc[i];
        const next = historyAsc[i + 1];
        if (current.next_follow_up_date && parseISO(next.date) > parseISO(current.next_follow_up_date)) {
          data.historicalLapses++;
        }
      }
    });

    reportMap.forEach(data => {
      data.conversionRate = data.totalLeads > 0 ? (data.signedContract / data.totalLeads) * 100 : 0;
    });

    return Array.from(reportMap.values());
  }, [leads, salesPersonnel, timeRange]);

  return { loading, processedData, salesPersonnel, timeRange, setTimeRange };
};