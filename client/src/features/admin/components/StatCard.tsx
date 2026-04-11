interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  subtitleColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  subtitleColor,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      {subtitle && (
        <p className={`text-xs mt-2 ${subtitleColor || 'text-gray-600 dark:text-gray-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
