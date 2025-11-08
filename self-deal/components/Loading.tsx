import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  overlay?: boolean;
  variant?: 'pulse' | 'orbit' | 'wave' | 'bounce' | 'matrix';
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  message = 'Loading...',
  overlay = false,
  variant = 'orbit'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6'
  };

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className={`relative ${sizeClasses[size]}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full animate-pulse delay-150 dark:bg-gray-800"></div>
            <div className="absolute inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse delay-300"></div>
          </div>
        );

      case 'wave':
        return (
          <div className={`flex items-end justify-center space-x-1 ${sizeClasses[size]}`}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-t from-indigo-500 to-purple-600 rounded-full animate-bounce"
                style={{
                  width: '12%',
                  height: '60%',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              ></div>
            ))}
          </div>
        );

      case 'bounce':
        return (
          <div className={`relative ${sizeClasses[size]}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-500 rounded-full animate-pulse opacity-75"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-gray-700 dark:border-t-indigo-600"></div>
            </div>
          </div>
        );

      case 'matrix':
        return (
          <div className={`relative ${sizeClasses[size]}`}>
            <div className="grid grid-cols-3 gap-1 w-full h-full">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-sm animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        );

      case 'orbit':
      default:
        return (
          <div className={`relative ${sizeClasses[size]}`}>
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full dark:border-gray-700"></div>
            
            {/* Spinning outer ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
            
            {/* Middle ring */}
            <div className="absolute inset-2 border-2 border-gray-100 rounded-full dark:border-gray-600"></div>
            <div className="absolute inset-2 border-2 border-transparent border-t-purple-400 border-l-pink-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            {/* Inner dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
            
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        );
    }
  };

  const LoadingContent = () => (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      {renderLoader()}
      {message && (
        <div className={`${textClasses[size]} font-medium text-gray-600 animate-pulse dark:text-gray-300`}>
          {message}
        </div>
      )}
      
      {/* Animated dots */}
      <div className="flex space-x-1 mt-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce dark:bg-gray-500"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center dark:bg-gray-900 dark:bg-opacity-90">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <LoadingContent />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center bg-white justify-center p-4 dark:bg-gray-900">
      <div className="text-center">
        <LoadingContent />
      </div>
    </div>
  );
};

// Preset loading components for common use cases
export const PageLoading: React.FC<{ message?: string }> = ({ message = "পেজ লোড হচ্ছে..." }) => (
  <Loading variant="orbit" size="lg" overlay message={message} />
);

export const ButtonLoading: React.FC = () => (
  <Loading variant="pulse" size="sm" message="" />
);

export const CardLoading: React.FC<{ message?: string }> = ({ message = "তথ্য লোড হচ্ছে..." }) => (
  <Loading variant="wave" size="md" message={message} />
);

export const PaymentLoading: React.FC = () => (
  <Loading variant="matrix" size="md" message="পেমেন্ট প্রক্রিয়া করা হচ্ছে..." overlay />
);

// Additional centered loading variants
export const CenteredLoading: React.FC<{ message?: string; variant?: 'pulse' | 'orbit' | 'wave' | 'bounce' | 'matrix' }> = ({ 
  message = "লোড হচ্ছে...", 
  variant = "orbit" 
}) => (
  <div className="min-h-[50vh] flex items-center justify-center dark:bg-gray-900">
    <Loading variant={variant} size="lg" message={message} />
  </div>
);

export const FullPageLoading: React.FC<{ message?: string }> = ({ message = "পেজ লোড হচ্ছে..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center dark:from-gray-900 dark:to-gray-800">
    <div className="bg-white rounded-2xl shadow-xl p-8 mx-4 max-w-sm w-full dark:bg-gray-800">
      <Loading variant="orbit" size="xl" message={message} />
    </div>
  </div>
);

export default Loading;