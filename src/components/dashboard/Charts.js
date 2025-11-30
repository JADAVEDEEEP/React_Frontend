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

const Charts = ({ priceChartData, quantityChartData, currentTheme }) => {
    return (
        <div className="row g-4 mb-4">
            {/* Price Chart */}
            <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">Top Products by Price</h5>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priceChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar
                                        dataKey="price"
                                        fill={currentTheme.primary}
                                        radius={[4, 4, 0, 0]}
                                        barSize={30}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quantity Chart */}
            <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">Inventory Status</h5>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={quantityChartData}>
                                    <defs>
                                        <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={currentTheme.secondary} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={currentTheme.secondary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="quantity"
                                        stroke={currentTheme.secondary}
                                        fillOpacity={1}
                                        fill="url(#colorQuantity)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Charts;
