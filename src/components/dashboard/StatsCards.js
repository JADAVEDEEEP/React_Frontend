import React from 'react';
import { Database, ShoppingBag, DollarSign, Activity } from 'lucide-react';

const StatsCards = ({ stats }) => {
    const cards = [
        {
            title: 'Total Revenue',
            value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'primary'
        },
        {
            title: 'Total Orders',
            value: stats.totalQuantity || 0,
            icon: ShoppingBag,
            color: 'success'
        },
        {
            title: 'Avg. Price',
            value: `$${(stats.avgPrice || 0).toFixed(2)}`,
            icon: Activity,
            color: 'warning'
        },
        {
            title: 'Total Products',
            value: stats.totalProducts || 0,
            icon: Database,
            color: 'info'
        }
    ];

    return (
        <div className="row g-4 mb-4">
            {cards.map((card, index) => (
                <div key={index} className="col-12 col-sm-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className={`bg-${card.color} bg-opacity-10 p-3 rounded text-${card.color}`}>
                                    <card.icon size={24} />
                                </div>
                                <span className="badge bg-light text-dark">+2.5%</span>
                            </div>
                            <h3 className="fw-bold mb-1">{card.value}</h3>
                            <p className="text-muted small mb-0">{card.title}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
