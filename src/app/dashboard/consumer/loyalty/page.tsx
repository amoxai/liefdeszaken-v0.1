import { Gift, Star, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

async function getLoyaltyData() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('loyalty_points')
    .eq('id', user.id)
    .single();

  // Get loyalty transactions
  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get available rewards
  const { data: rewards } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_required', { ascending: true });

  return {
    points: profile?.loyalty_points || 0,
    transactions: transactions || [],
    rewards: rewards || [],
  };
}

export default async function LoyaltyPage() {
  const data = await getLoyaltyData();

  if (!data) {
    return <div>Laden...</div>;
  }

  const { points, transactions, rewards } = data;

  // Calculate progress
  const nextRewardAt = Math.ceil((points + 1) / 500) * 500;
  const progressPercentage = ((points % 500) / 500) * 100;

  return (
    <div>
      <h1 className="dashboard-page-title" style={{ marginBottom: '2rem' }}>
        Loyaliteitsprogramma
      </h1>

      {/* Loyalty Card */}
      <div className="loyalty-card" style={{ marginBottom: '2rem' }}>
        <div className="loyalty-card-header">
          <span className="loyalty-card-title">Jouw Saldo</span>
          <Star size={24} />
        </div>
        <div className="loyalty-card-points">
          {points} <span>punten</span>
        </div>
        <div className="loyalty-progress-bar">
          <div 
            className="loyalty-progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="loyalty-progress-text">
          Nog {nextRewardAt - points} punten tot je volgende beloning!
        </div>
      </div>

      {/* How it works */}
      <div className="checkout-form-section" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Hoe werkt het?
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '2.5rem', 
              height: '2.5rem', 
              background: '#fdf2f8', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec4899',
              flexShrink: 0
            }}>
              1
            </div>
            <div>
              <strong>Verdien punten</strong>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Je verdient 1 punt voor elke euro die je uitgeeft.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '2.5rem', 
              height: '2.5rem', 
              background: '#fdf2f8', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec4899',
              flexShrink: 0
            }}>
              2
            </div>
            <div>
              <strong>Wissel in voor beloningen</strong>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                Gebruik je punten voor kortingen, gratis verzending en meer!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
        Beschikbare Beloningen
      </h2>
      
      {rewards.length > 0 ? (
        <div className="rewards-grid" style={{ marginBottom: '2rem' }}>
          {rewards.map((reward) => {
            const canClaim = points >= reward.points_required;
            
            return (
              <div 
                key={reward.id} 
                className={`reward-card ${!canClaim ? 'locked' : ''}`}
              >
                <div className="reward-card-image">
                  <Gift size={40} color={canClaim ? '#ec4899' : '#9ca3af'} />
                </div>
                <div className="reward-card-content">
                  <h3 className="reward-card-title">{reward.name}</h3>
                  <p className="reward-card-description">{reward.description}</p>
                  <div className="reward-card-points">
                    <span className="reward-card-points-value">
                      {reward.points_required} punten
                    </span>
                    <button
                      className="reward-card-claim-button"
                      disabled={!canClaim}
                    >
                      {canClaim ? 'Inwisselen' : <Lock size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#6b7280',
          background: 'white',
          borderRadius: '1rem'
        }}>
          <Gift size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Er zijn momenteel geen beloningen beschikbaar.</p>
        </div>
      )}

      {/* Transaction History */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
        Puntenhistorie
      </h2>
      
      <div className="dashboard-table-container">
        {transactions.length > 0 ? (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Beschrijving</th>
                  <th>Type</th>
                  <th>Punten</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.created_at).toLocaleDateString('nl-NL')}</td>
                    <td>{transaction.description}</td>
                    <td>
                      <span className={`status-badge ${
                        transaction.type === 'earned' ? 'status-badge-paid' :
                        transaction.type === 'redeemed' ? 'status-badge-processing' :
                        'status-badge-cancelled'
                      }`}>
                        {transaction.type === 'earned' && 'Verdiend'}
                        {transaction.type === 'redeemed' && 'Ingewisseld'}
                        {transaction.type === 'expired' && 'Verlopen'}
                        {transaction.type === 'adjusted' && 'Aangepast'}
                      </span>
                    </td>
                    <td style={{ 
                      fontWeight: 600,
                      color: transaction.points > 0 ? '#22c55e' : '#ef4444'
                    }}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            <p>Je hebt nog geen puntenhistorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
