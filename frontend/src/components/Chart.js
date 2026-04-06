import { Line } from "react-chartjs-2";

export default function Chart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Portfolio Growth",
        data: [10000, 15000, 13000, 20000],
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <Line data={data} />
    </div>
  );
}