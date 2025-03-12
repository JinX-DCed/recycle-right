#!/bin/bash

# Create a temporary file with the updated StatisticsPage
cat > ./temp_stats_page.tsx << 'EOL'
import React, { useState } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRecycle, faChartPie, faTrophy, faCalendarDay, faCalendarWeek, faCalendarAlt, faInfinity, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

// Styled components
const PageContainer = styled.div`
  padding: 16px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #006647;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateX(-3px);
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #006647;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 24px;
`;

const StatsContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #f0fdf4;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #22c55e;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-bottom: 24px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const ColorIndicator = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  background-color: ${(props) => props.color};
  border-radius: 3px;
  margin-right: 8px;
`;

const AchievementSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const AchievementTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Achievement = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fffbeb;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 5px solid #fbbf24;
`;

const AchievementIcon = styled.div`
  color: #f59e0b;
  font-size: 24px;
`;

const AchievementInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AchievementName = styled.span`
  font-weight: 600;
  color: #111827;
`;

const AchievementDesc = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

// New styled components for the filter
const FilterContainer = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 20px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 20px;
  margin-right: 10px;
  background-color: ${(props) => (props.isActive ? '#006647' : '#e5e7eb')};
  color: ${(props) => (props.isActive ? 'white' : '#4b5563')};
  font-weight: ${(props) => (props.isActive ? '600' : '500')};
  white-space: nowrap;
  transition: all 0.2s ease-in-out;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${(props) => (props.isActive ? '#00533a' : '#d1d5db')};
    transform: translateY(-1px);
  }
`;

// Mock data for different time periods
const dailyData = [
  { name: 'Plastic', value: 4, color: '#FF6384' },
  { name: 'Paper', value: 3, color: '#36A2EB' },
  { name: 'Glass', value: 1, color: '#FFCE56' },
  { name: 'Metal', value: 2, color: '#4BC0C0' },
  { name: 'Others', value: 0, color: '#9966FF' }
];

const weeklyData = [
  { name: 'Plastic', value: 12, color: '#FF6384' },
  { name: 'Paper', value: 8, color: '#36A2EB' },
  { name: 'Glass', value: 5, color: '#FFCE56' },
  { name: 'Metal', value: 7, color: '#4BC0C0' },
  { name: 'Others', value: 2, color: '#9966FF' }
];

const monthlyData = [
  { name: 'Plastic', value: 35, color: '#FF6384' },
  { name: 'Paper', value: 25, color: '#36A2EB' },
  { name: 'Glass', value: 15, color: '#FFCE56' },
  { name: 'Metal', value: 20, color: '#4BC0C0' },
  { name: 'Others', value: 5, color: '#9966FF' }
];

const allTimeData = [
  { name: 'Plastic', value: 120, color: '#FF6384' },
  { name: 'Paper', value: 95, color: '#36A2EB' },
  { name: 'Glass', value: 45, color: '#FFCE56' },
  { name: 'Metal', value: 60, color: '#4BC0C0' },
  { name: 'Others', value: 18, color: '#9966FF' }
];

// Mock stats for different time periods
const statsData = {
  daily: { itemsRecycled: 10, pointsEarned: 30, streakDays: 1 },
  weekly: { itemsRecycled: 34, pointsEarned: 102, streakDays: 5 },
  monthly: { itemsRecycled: 100, pointsEarned: 300, streakDays: 14 },
  allTime: { itemsRecycled: 338, pointsEarned: 1014, streakDays: 22 }
};

type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

const StatisticsPage: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<FilterPeriod>('weekly');
  const navigate = useNavigate();

  // Navigate back to home page
  const handleGoBack = () => {
    navigate('/');
  };

  // Get data based on active period
  const getChartData = () => {
    switch (activePeriod) {
      case 'daily':
        return dailyData;
      case 'weekly':
        return weeklyData;
      case 'monthly':
        return monthlyData;
      case 'allTime':
        return allTimeData;
      default:
        return weeklyData;
    }
  };

  // Get stats based on active period
  const getStats = () => {
    return statsData[activePeriod];
  };

  const renderCustomizedLabel = ({ 
    cx, cy, midAngle, innerRadius, outerRadius, percent, index 
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Get period text for display
  const getPeriodText = () => {
    switch (activePeriod) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      case 'allTime':
        return 'All Time';
      default:
        return 'This Week';
    }
  };

  const currentStats = getStats();
  const chartData = getChartData();

  return (
    <PageContainer>
      <TopBar>
        <BackButton onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </BackButton>
        <Title>
          <FontAwesomeIcon icon={faChartPie} /> Recycling Statistics
        </Title>
      </TopBar>
      <Subtitle>Track your recycling habits and environmental impact</Subtitle>

      <FilterContainer>
        <FilterButton 
          isActive={activePeriod === 'daily'} 
          onClick={() => setActivePeriod('daily')}
        >
          <FontAwesomeIcon icon={faCalendarDay} /> Daily
        </FilterButton>
        <FilterButton 
          isActive={activePeriod === 'weekly'} 
          onClick={() => setActivePeriod('weekly')}
        >
          <FontAwesomeIcon icon={faCalendarWeek} /> Weekly
        </FilterButton>
        <FilterButton 
          isActive={activePeriod === 'monthly'} 
          onClick={() => setActivePeriod('monthly')}
        >
          <FontAwesomeIcon icon={faCalendarAlt} /> Monthly
        </FilterButton>
        <FilterButton 
          isActive={activePeriod === 'allTime'} 
          onClick={() => setActivePeriod('allTime')}
        >
          <FontAwesomeIcon icon={faInfinity} /> All Time
        </FilterButton>
      </FilterContainer>

      <StatsContainer>
        <h3 style={{ margin: '0 0 16px 0', color: '#4b5563', fontSize: '16px' }}>
          {getPeriodText()} Summary
        </h3>
        <StatCard>
          <StatInfo>
            <StatLabel>Items Recycled</StatLabel>
            <StatValue>{currentStats.itemsRecycled}</StatValue>
          </StatInfo>
          <FontAwesomeIcon icon={faRecycle} size="2x" color="#22c55e" />
        </StatCard>
        
        <StatCard>
          <StatInfo>
            <StatLabel>Points Earned</StatLabel>
            <StatValue>{currentStats.pointsEarned}</StatValue>
          </StatInfo>
          <FontAwesomeIcon icon={faTrophy} size="2x" color="#f59e0b" />
        </StatCard>
        
        <StatCard>
          <StatInfo>
            <StatLabel>Best Streak</StatLabel>
            <StatValue>{currentStats.streakDays} days</StatValue>
          </StatInfo>
          <span style={{ fontSize: '28px' }}>🔥</span>
        </StatCard>
      </StatsContainer>

      <ChartContainer>
        <ChartTitle>
          <FontAwesomeIcon icon={faChartPie} /> {getPeriodText()} Recycled Items
        </ChartTitle>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} items`, null]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <AchievementSection>
        <AchievementTitle>
          <FontAwesomeIcon icon={faTrophy} /> Recent Achievements
        </AchievementTitle>
        <Achievement>
          <AchievementIcon>
            <FontAwesomeIcon icon={faTrophy} />
          </AchievementIcon>
          <AchievementInfo>
            <AchievementName>Recycling Champion</AchievementName>
            <AchievementDesc>Recycled 10 items in one week</AchievementDesc>
          </AchievementInfo>
        </Achievement>
        <Achievement>
          <AchievementIcon>
            <FontAwesomeIcon icon={faTrophy} />
          </AchievementIcon>
          <AchievementInfo>
            <AchievementName>Paper Master</AchievementName>
            <AchievementDesc>Recycled 5 paper items</AchievementDesc>
          </AchievementInfo>
        </Achievement>
      </AchievementSection>
    </PageContainer>
  );
};

export default StatisticsPage;
EOL

# Replace the original file with the temporary file
mv temp_stats_page.tsx ./src/pages/StatisticsPage.tsx

echo "Back button added to statistics page!"
