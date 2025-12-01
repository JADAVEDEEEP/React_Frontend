import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, BarChart3 } from "lucide-react";

const Charts = ({ priceChartData, quantityChartData, currentTheme }) => {
    return (
        <>
            <style>
                {`
                .chart-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 22px;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
                    transition: 0.2s;
                }

                .chart-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
                }

                .chart-title-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 18px;
                }

                .chart-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.05);
                }

                .chart-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b;
                }
            `}
            </style>

            <div className="row g-4 mb-4">

                {/* PRICE CHART */}
                <div className="col-12 col-lg-6">
                    <div className="chart-card h-100">

                        <div className="chart-title-box">
                            <div className="chart-icon" style={{ background: `${currentTheme.primary}15` }}>
                                <BarChart3 size={22} color={currentTheme.primary} />
                            </div>
                            <div className="chart-title">Top Products by Price</div>
                        </div>

                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priceChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ececec" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: '#9ca3af' }} 
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            borderRadius: 14,
                                            border: "none",
                                            padding: "10px 14px",
                                            boxShadow: "0 8px 20px rgba(0,0,0,0.12)"
                                        }}
                                    />
                                    <Bar
                                        dataKey="price"
                                        fill={currentTheme.primary}
                                        radius={[10, 10, 0, 0]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                    </div>
                </div>

                {/* QUANTITY CHART */}
                <div className="col-12 col-lg-6">
                    <div className="chart-card h-100">

                        <div className="chart-title-box">
                            <div className="chart-icon" style={{ background: `${currentTheme.secondary}15` }}>
                                <TrendingUp size={22} color={currentTheme.secondary} />
                            </div>
                            <div className="chart-title">Inventory Status</div>
                        </div>

                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={quantityChartData}>
                                    <defs>
                                        <linearGradient id="QtyGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={currentTheme.secondary} stopOpacity={0.7} />
                                            <stop offset="95%" stopColor={currentTheme.secondary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ececec" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: '#9ca3af' }} 
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 14,
                                            border: "none",
                                            padding: "10px 14px",
                                            boxShadow: "0 8px 20px rgba(0,0,0,0.12)"
                                        }}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="quantity"
                                        stroke={currentTheme.secondary}
                                        fillOpacity={1}
                                        fill="url(#QtyGradient)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                    </div>
                </div>

            </div>
        </>
    );
};

export default Charts;
