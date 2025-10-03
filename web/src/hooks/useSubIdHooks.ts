import { useSubIdContext } from '../contexts/SubIdContext';

// For backward compatibility, provide individual hooks
export function useSubId(): string {
  const { subId } = useSubIdContext();
  return subId;
}

export function useSubIdNavigation() {
  const { subId, navigateWithSubId, buildUrlWithSubId } = useSubIdContext();
  return {
    subId,
    navigateWithSubId,
    buildUrlWithSubId,
  };
}
