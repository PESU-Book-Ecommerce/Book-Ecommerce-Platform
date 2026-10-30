
const BASE_URL = "http://localhost:5000";

async function runPerformanceTest() {
  const totalRequests = 50;
  const times = [];
  let failures = 0;

  console.log("Starting performance test...");

  for (let i = 0; i < totalRequests; i++) {
    const start = performance.now();

    try {
      const response = await fetch(`${BASE_URL}/api/books`);

      if (!response.ok) {
        failures++;
      }

      await response.arrayBuffer();
    } catch (error) {
      failures++;
    }

    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);

  const average =
    times.reduce((a, b) => a + b, 0) / times.length;

  const p95Index = Math.ceil(times.length * 0.95) - 1;

  console.log("\n===== PERFORMANCE TEST RESULTS =====");
  console.log("Total requests:", totalRequests);
  console.log("Failed requests:", failures);
  console.log("Average response time:", average.toFixed(2), "ms");
  console.log("95th percentile:", times[p95Index].toFixed(2), "ms");
}

runPerformanceTest();
