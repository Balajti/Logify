'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', tasks: 4, hours: 6 },
  { name: 'Tue', tasks: 3, hours: 7 },
  { name: 'Wed', tasks: 5, hours: 8 },
  { name: 'Thu', tasks: 6, hours: 7 },
  { name: 'Fri', tasks: 4, hours: 6 },
];

export function TrendChart() {

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
        <Card>
            <CardHeader>
            <CardTitle>Weekly Trends</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="h-[300px] flex items-center justify-center">
                Loading...
            </div>
            </CardContent>
        </Card>
        );
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="tasks" 
                stroke="#8884d8" 
                name="Tasks Completed"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#82ca9d" 
                name="Hours Logged"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}