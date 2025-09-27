import { motion } from "framer-motion";

// Beautiful Skeleton Loading Card Component
export default function SkeletonMarketCard({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: 20,
        backdropFilter: "blur(10px)",
        height: "520px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          animation: "shimmer 2s infinite",
          zIndex: 1,
        }}
      />

      {/* Header section */}
      <div style={{ marginBottom: 16, flexShrink: 0, position: "relative", zIndex: 2 }}>
        {/* Status badges row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Live badge skeleton */}
            <div
              style={{
                width: 60,
                height: 24,
                borderRadius: 20,
                background: "rgba(255,255,255,0.1)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            {/* Status badge skeleton */}
            <div
              style={{
                width: 80,
                height: 24,
                borderRadius: 6,
                background: "rgba(255,255,255,0.08)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
          {/* Refresh button skeleton */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "rgba(255,255,255,0.08)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Market question skeleton */}
        <div
          style={{
            height: 24,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 6,
            marginBottom: 8,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 20,
            width: "70%",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 6,
            marginBottom: 8,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />

        {/* Market details skeleton */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              height: 16,
              width: 200,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 4,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          {/* Countdown skeleton */}
          <div
            style={{
              height: 20,
              width: 100,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 6,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Pool Information skeleton */}
      <div style={{ marginBottom: 16, flexShrink: 0, position: "relative", zIndex: 2 }}>
        {/* Pool stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: 14,
              width: 120,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 4,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 14,
              width: 150,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 4,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Visual pool bar skeleton */}
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
            marginBottom: 12,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />

        {/* Pool details grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {/* Yes pool skeleton */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: "rgba(76, 175, 80, 0.08)",
              border: "1px solid rgba(76, 175, 80, 0.2)",
            }}
          >
            <div
              style={{
                height: 12,
                width: 60,
                background: "rgba(76, 175, 80, 0.3)",
                borderRadius: 4,
                marginBottom: 8,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                height: 18,
                width: 80,
                background: "rgba(76, 175, 80, 0.2)",
                borderRadius: 4,
                marginBottom: 4,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>

          {/* No pool skeleton */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: "rgba(244, 67, 54, 0.08)",
              border: "1px solid rgba(244, 67, 54, 0.2)",
            }}
          >
            <div
              style={{
                height: 12,
                width: 50,
                background: "rgba(244, 67, 54, 0.3)",
                borderRadius: 4,
                marginBottom: 8,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                height: 18,
                width: 70,
                background: "rgba(244, 67, 54, 0.2)",
                borderRadius: 4,
                marginBottom: 4,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* Betting section skeleton */}
      <div style={{ marginBottom: 16, flexShrink: 0, position: "relative", zIndex: 2 }}>
        <div
          style={{
            height: 14,
            width: 100,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 4,
            marginBottom: 12,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />

        {/* Quick amount buttons skeleton */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              style={{
                height: 28,
                width: 60,
                borderRadius: 6,
                background: "rgba(255,255,255,0.08)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>

        {/* Betting input and buttons skeleton */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: 40,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 40,
              width: 80,
              background: "rgba(76, 175, 80, 0.1)",
              borderRadius: 8,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 40,
              width: 80,
              background: "rgba(244, 67, 54, 0.1)",
              borderRadius: 8,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Action buttons skeleton */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            height: 32,
            width: 80,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 6,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </motion.div>
  );
}
