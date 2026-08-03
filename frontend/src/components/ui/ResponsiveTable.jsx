/**
 * ResponsiveTable
 *
 * Desktop: Normal clean table.
 * Mobile:  Each row becomes a self-contained vertical card.
 *          No horizontal scroll. Ever.
 *
 * Props:
 *   columns   — array of { key, label, render? }
 *   data      — array of row objects
 *   keyField  — unique key for each row (default '_id')
 *   actions   — optional render function (row) => JSX for last cell
 *   emptyText — text shown when data is empty
 */
import useDevice from '../../hooks/useDevice';

const ResponsiveTable = ({
    columns = [],
    data = [],
    keyField = '_id',
    actions,
    emptyText = 'No records found.',
    loading = false,
}) => {
    const { isMobile } = useDevice();

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '36px', height: '36px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            Loading...
        </div>
    );

    if (!data.length) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            {emptyText}
        </div>
    );

    /* ── MOBILE: Vertical Cards ─────────────────────────────── */
    if (isMobile) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.map((row, idx) => (
                    <div key={row[keyField] || idx} style={{
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-sm)',
                    }}>
                        {columns.map(col => (
                            <div key={col.key} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                padding: '0.6rem 0',
                                borderBottom: '1px dashed var(--border)',
                            }}>
                                <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '800',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    flexShrink: 0,
                                    paddingTop: '2px',
                                }}>
                                    {col.label}
                                </span>
                                <div style={{ textAlign: 'right', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                                </div>
                            </div>
                        ))}
                        {actions && (
                            <div style={{ paddingTop: '0.85rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {actions(row)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    /* ── DESKTOP: Normal Table ──────────────────────────────── */
    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                    <tr style={{ background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)' }}>
                        {columns.map(col => (
                            <th key={col.key} style={{
                                padding: '1rem 1.25rem',
                                textAlign: 'left',
                                fontWeight: '800',
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                whiteSpace: 'nowrap',
                            }}>
                                {col.label}
                            </th>
                        ))}
                        {actions && (
                            <th style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '800', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={row[keyField] || idx}
                            style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-alt)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        >
                            {columns.map(col => (
                                <td key={col.key} style={{ padding: '1rem 1.25rem', color: 'var(--text-main)' }}>
                                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                                </td>
                            ))}
                            {actions && (
                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        {actions(row)}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResponsiveTable;
