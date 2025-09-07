import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme } from 'victory-native';
import { Grade } from '../utils/types';
import { COLORS, GRADE_COLORS } from '../utils/constants';

interface ChartProps {
  grades: Grade[];
  type?: 'line' | 'area';
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

const Chart: React.FC<ChartProps> = ({ grades, type = 'line' }) => {
  if (!grades || grades.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No grades to display</Text>
      </View>
    );
  }

  // Prepare data for chart
  const chartData = grades
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((grade, index) => ({
      x: index + 1,
      y: grade.score,
      label: `${grade.subject}: ${grade.score}`,
      date: new Date(grade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  // Calculate statistics
  const avgScore = grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length;
  const maxScore = Math.max(...grades.map(g => g.score));
  const minScore = Math.min(...grades.map(g => g.score));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Academic Progress</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{avgScore.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>{maxScore.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>{minScore.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Lowest</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <VictoryChart
          theme={VictoryTheme.material}
          width={chartWidth}
          height={200}
          padding={{ left: 50, top: 20, right: 50, bottom: 50 }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t: number) => `${t}`}
            domain={[0, 10]}
            style={{
              axis: { stroke: COLORS.lightGray },
              tickLabels: { fontSize: 12, fill: COLORS.gray },
              grid: { stroke: COLORS.lightGray, strokeDasharray: "2,2" }
            }}
          />
          
          <VictoryAxis
            tickFormat={(x: number) => chartData[x - 1]?.date || ''}
            style={{
              axis: { stroke: COLORS.lightGray },
              tickLabels: { fontSize: 10, fill: COLORS.gray, angle: -45 }
            }}
          />

          {type === 'area' ? (
            <VictoryArea
              data={chartData}
              style={{
                data: { 
                  fill: COLORS.primary, 
                  fillOpacity: 0.3,
                  stroke: COLORS.primary,
                  strokeWidth: 2
                }
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
          ) : (
            <VictoryLine
              data={chartData}
              style={{
                data: { 
                  stroke: COLORS.primary,
                  strokeWidth: 3
                }
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
          )}
        </VictoryChart>
      </View>

      {/* Grade legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Recent Grades:</Text>
        <View style={styles.legendItems}>
          {grades.slice(-3).map((grade, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: GRADE_COLORS[grade.type] }]} />
              <Text style={styles.legendText}>
                {grade.subject}: {grade.score}/10 ({grade.type})
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  chartContainer: {
    alignItems: 'center',
  },
  legend: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'column',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});

export default Chart;