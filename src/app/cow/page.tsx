export default function SplashScreen() {
  return (
    <div
      className="relative flex items-center justify-center w-full min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #4D9040 0%, #4A8C3C 25%, #478838 50%, #438434 75%, #3F8030 100%)",
      }}
    >


        {/* Inner bright core */}
        {/* Cow silhouette */}
        <div className="flex flex-col items-center z-10">
          <img
            src="https://cdn.prod.website-files.com/642b08d9f919f4a6470dea8f/6436947376dd6e87c5b84177_logo.svg"
            alt="Logo"
            style={{ width: 160, height: 160 }}
            className="mb-4"
          />
          <svg
            className="animate-spin h-8 w-8 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
  );
}
