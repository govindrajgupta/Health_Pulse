import React from 'react';
import { Trophy, Target, Award, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
  progress?: number;
  target?: number;
}

interface AchievementTrackerProps {
  steps: number;
  heartRate: number;
  caloriesBurned: number;
  activeMinutes: number;
}

const AchievementTracker: React.FC<AchievementTrackerProps> = ({
  steps,
  heartRate,
  caloriesBurned,
  activeMinutes,
}) => {
  const achievements: Achievement[] = [
    {
      id: '10k-steps',
      title: '10K Steps',
      description: 'Walk 10,000 steps today',
      icon: <Target className="text-blue-600" size={24} />,
      achieved: steps >= 10000,
      progress: steps,
      target: 10000,
    },
    {
      id: 'cardio-champion',
      title: 'Cardio Champion',
      description: 'Maintain heart rate above 100 BPM',
      icon: <Zap className="text-red-600" size={24} />,
      achieved: heartRate > 100,
    },
    {
      id: 'calorie-crusher',
      title: 'Calorie Crusher',
      description: 'Burn 2,000 calories',
      icon: <Trophy className="text-orange-600" size={24} />,
      achieved: caloriesBurned >= 2000,
      progress: caloriesBurned,
      target: 2000,
    },
    {
      id: 'active-hour',
      title: 'Active Hour',
      description: '60 minutes of activity',
      icon: <Award className="text-green-600" size={24} />,
      achieved: activeMinutes >= 60,
      progress: activeMinutes,
      target: 60,
    },
  ];

  const achievedCount = achievements.filter(a => a.achieved).length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Daily Achievements</h3>
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={20} />
          <span className="font-bold text-slate-700">
            {achievedCount}/{achievements.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg border transition-all ${
              achievement.achieved
                ? 'bg-green-50 border-green-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${achievement.achieved ? 'opacity-100' : 'opacity-50'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-800">{achievement.title}</h4>
                  {achievement.achieved && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-2">{achievement.description}</p>
                
                {achievement.target && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{achievement.progress!.toLocaleString()}</span>
                      <span>{achievement.target.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          achievement.achieved ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min((achievement.progress! / achievement.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {achievedCount === achievements.length && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-sm font-bold text-yellow-800">
            🎉 All achievements unlocked today!
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementTracker;
