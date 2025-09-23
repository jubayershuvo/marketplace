import QubeStar from "./svg/QubeStar";

export default function Level({ level }: { level: string | number }) {
  const levelNumber = Number(level);
  const maxStars = 3;

  // Top Rated seller
  if (levelNumber > 2) {
    return (
      <div className="flex items-center gap-2 bg-orange-200 px-2 py-0.5 rounded-md">
        <span className="">Top Rated</span>
        <div className="flex gap-1">
          {Array.from({ length: maxStars }, (_, i) => (
            <QubeStar key={i} fill={true} />
          ))}
        </div>
      </div>
    );
  }

  // Levels 1–2
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">Level {levelNumber}</span>
      <div className="flex gap-1">
        {Array.from({ length: maxStars }, (_, i) => (
          <QubeStar key={i} fill={i < levelNumber} />
        ))}
      </div>
    </div>
  );
}
