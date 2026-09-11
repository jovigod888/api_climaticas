import styles from './Header.module.css';

function formatTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function Header({ total, updatedAt, onRefresh, refreshing }) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>clima.</h1>
        <p className={styles.meta}>
          {total} {total === 1 ? 'país' : 'países'} no total.{' '}
          {updatedAt ? `Atualizado às ${formatTime(updatedAt)}.` : 'Carregando.'}
        </p>
      </div>
      <button
        type="button"
        className={styles.refresh}
        onClick={onRefresh}
        disabled={refreshing}
        aria-label="Atualizar o clima de todos os países"
      >
        {refreshing ? 'Atualizando' : 'Atualizar'}
      </button>
    </header>
  );
}
