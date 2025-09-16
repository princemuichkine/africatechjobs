'use client';

import { useOpenPanel } from '@openpanel/nextjs';
import { useCallback } from 'react';

export const useAnalytics = () => {
    const op = useOpenPanel();

    const trackJobView = useCallback((jobId: string) => {
        op.track('job_viewed', { job_id: jobId });
    }, [op]);

    const trackJobApply = useCallback((jobId: string) => {
        op.track('job_applied', { job_id: jobId });
    }, [op]);

    const trackCompanyView = useCallback((companyId: string) => {
        op.track('company_viewed', { company_id: companyId });
    }, [op]);

    const trackSearch = useCallback((query: string, filters: Record<string, unknown>) => {
        op.track('job_search', {
            search_query: query,
            filters: filters
        });
    }, [op]);

    const trackAdClick = useCallback((adId: string) => {
        op.track('ad_clicked', { ad_id: adId });
    }, [op]);

    const trackAdView = useCallback((adId: string) => {
        op.track('ad_viewed', { ad_id: adId });
    }, [op]);

    const trackUserAction = useCallback((action: string, properties?: Record<string, unknown>) => {
        op.track(action, properties);
    }, [op]);

    const identifyUser = useCallback((userId: string, properties?: Record<string, unknown>) => {
        op.identify({
            profileId: userId,
            ...properties,
        });
    }, [op]);

    const setGlobalProperties = useCallback((properties: Record<string, unknown>) => {
        op.setGlobalProperties(properties);
    }, [op]);

    return {
        trackJobView,
        trackJobApply,
        trackCompanyView,
        trackSearch,
        trackAdClick,
        trackAdView,
        trackUserAction,
        identifyUser,
        setGlobalProperties,
    };
};
