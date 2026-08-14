import { Link } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="font-mono text-6xl font-bold text-accent">404</div>
      <p className="text-sm text-muted">{t.errors.pageNotFound}</p>
      <Link to="/">
        <Button variant="primary">{t.errors.backHome}</Button>
      </Link>
    </div>
  );
}
