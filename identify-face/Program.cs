using System;

namespace identify_face
{
  class Program
  {
    static void Main(string[] args)
    {
      Console.WriteLine("Running");

      var configCognitiveSubscriptionKey = Environment.GetEnvironmentVariable("AZURE_COGNITIVE_SUBSCRIPTION_KEY");
      var configCognitiveEndpoint = Environment.GetEnvironmentVariable("AZURE_COGNITIVE_ENDPOINT");
      Console.WriteLine($"Got Endpoint: {configCognitiveEndpoint}");
    }
  }
}
