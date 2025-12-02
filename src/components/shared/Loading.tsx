interface LoadingProps {
  message: string;
}

export default function Loading({ message }: LoadingProps) {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full min-h-[400px] space-y-6">
      <div className="w-12 h-12 border-4 rounded-full animate-spin border-t-green-500"></div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 animate-pulse">
          Loading {message}
        </h3>
        <p className="text-sm text-gray-500">
          Mohon menunggu, kami sedang mengambil data terbaru..
        </p>
      </div>
    </div>
  );
}
