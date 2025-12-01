import React from "react";
import { Database, ShoppingBag, DollarSign, Activity } from "lucide-react";

const StatsCards = ({ stats }) => {
    const cards = [
        {
            title: "Total Revenue",
            value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            gradient: "linear-gradient(135deg, #6366f1, #3b82f6)"
        },
        {
            title: "Total Orders",
            value: stats.totalQuantity || 0,
            icon: ShoppingBag,
            gradient: "linear-gradient(135deg, #10b981, #059669)"
        },
        {
            title: "Avg. Price",
            value: `$${(stats.avgPrice || 0).toFixed(2)}`,
            icon: Activity,
            gradient: "linear-gradient(135deg, #f59e0b, #d97706)"
        },
        {
            title: "Total Products",
            value: stats.totalProducts || 0,
            icon: Database,
            gradient: "linear-gradient(135deg, #0ea5e9, #0284c7)"
        }
    ];

    return (
        <>
            <style>{`
                .stats-wrapper {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 24px;
                }

                .stats-card {
                    padding: 26px;
                    border-radius: 22px;
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.38);
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                    position: relative;
                    overflow: hidden;
                }

                .stats-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 8px 28px rgba(0,0,0,0.12);
                }

                .stats-bg {
                    position: absolute;
                    top: -40px;
                    right: -40px;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    opacity: 0.2;
                    filter: blur(6px);
                }

                .icon-box {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 14px;
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(6px);
                }

                .stats-title {
                    color: #64748b;
                    font-size: 15px;
                    font-weight: 500;
                    margin-bottom: 6px;
                }

                .stats-value {
                    font-size: 30px;
                    font-weight: 800;
                    color: #1e293b;
                }
            `}</style>

            <div className="stats-wrapper mb-4">
                {cards.map((card, index) => (
                    <div className="stats-card" key={index}>
                        <div
                            className="stats-bg"
                            style={{ background: card.gradient }}
                        ></div>

                        <div className="icon-box">
                            <card.icon size={26} color="#1e293b" />
                        </div>

                        <div className="stats-title">{card.title}</div>
                        <div className="stats-value">{card.value}</div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default StatsCards;
