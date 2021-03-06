﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using System.Text.Json;
using System.Text.Json.Serialization;

using Microsoft.Azure.CognitiveServices.Vision.Face;
using Microsoft.Azure.CognitiveServices.Vision.Face.Models;

namespace identify_face
{
  class Program
  {
    const string RECOGNITION_MODEL = RecognitionModel.Recognition03;
    static async Task Main(string[] args)
    {
      Console.WriteLine("Running");

      var configCognitiveSubscriptionKey = Environment.GetEnvironmentVariable("AZURE_COGNITIVE_SUBSCRIPTION_KEY");
      var configCognitiveEndpoint = Environment.GetEnvironmentVariable("AZURE_COGNITIVE_ENDPOINT");
      var faceBaseImageUrl = Environment.GetEnvironmentVariable("AZURE_COGNITIVE_IMAGE_BASE_URL");

      IFaceClient client = Authenticate(configCognitiveEndpoint, configCognitiveSubscriptionKey);

      //await DetectFaceExtract(client, faceBaseImageUrl, RECOGNITION_MODEL);
      await FindSimilar(client, faceBaseImageUrl, RECOGNITION_MODEL);
    }

    public static IFaceClient Authenticate(string endpoint, string key)
    {
      return new FaceClient(new ApiKeyServiceClientCredentials(key)) { Endpoint = endpoint };
    }

    public static async Task DetectFaceExtract(IFaceClient client, string baseUrl, string recognitionModel)
    {
      //TODO: get all images from blob
      var imageFileNames = new List<string>{$"{baseUrl}normal.jpg", $"{baseUrl}mouthonly.jpg", $"{baseUrl}full.jpg"};

      foreach (var imageFileName in imageFileNames)
      {
        Console.WriteLine($"Calling: {client.Endpoint} for image {imageFileName}");
        IList<DetectedFace> detectedFaces;

        // Detect faces with all attributes from image url.
        detectedFaces = await client.Face.DetectWithUrlAsync(imageFileName,
          returnFaceAttributes: new List<FaceAttributeType?> { FaceAttributeType.Accessories, FaceAttributeType.Age,
          FaceAttributeType.Blur, FaceAttributeType.Emotion, FaceAttributeType.Exposure, FaceAttributeType.FacialHair,
          FaceAttributeType.Gender, FaceAttributeType.Glasses, FaceAttributeType.Hair, FaceAttributeType.HeadPose,
          FaceAttributeType.Makeup, FaceAttributeType.Noise, FaceAttributeType.Occlusion, FaceAttributeType.Smile },
          // We specify detection model 1 because we are retrieving attributes.
          detectionModel: DetectionModel.Detection01,
          recognitionModel: recognitionModel);

        Console.WriteLine($"{detectedFaces.Count} face(s) detected from image `{imageFileName}`.");
        if (detectedFaces.Any())
        {
          var firstFace = detectedFaces.First();
          Console.WriteLine($"We got ya face! `{firstFace.FaceId}`!  Attributes: {JsonSerializer.Serialize(firstFace.FaceAttributes)}.  Landmarks: {JsonSerializer.Serialize(firstFace.FaceLandmarks)}");
        }

      }
    }

    public static async Task FindSimilar(IFaceClient client, string baseUrl, string recognitionModel)
    {
      var targetImageFileNames = new List<string>{$"{baseUrl}mouthonly.jpg", $"{baseUrl}full.jpg"};

      string sourceImageFileName = $"{baseUrl}normal.jpg";
      IList<Guid?> targetFaceIds = new List<Guid?>();
      foreach (var targetImageFileName in targetImageFileNames)
      {
          var faces = await DetectFaceRecognize(client, targetImageFileName, recognitionModel);
          if (faces.Count == 1)
          {
            targetFaceIds.Add(faces.First().FaceId.Value);
          }
          else
          {
            Console.WriteLine($"WARNING: NO FACE FOUND IN IMAGE {targetImageFileName}");
          }
          
      }

      IList<DetectedFace> detectedFaces = await DetectFaceRecognize(client, sourceImageFileName, recognitionModel);

      var similarResults = await client.Face.FindSimilarAsync(detectedFaces[0].FaceId.Value, null, null, targetFaceIds);
      Console.WriteLine($"Found {similarResults.Count} similar results: {JsonSerializer.Serialize(similarResults)}");
    }

    private static async Task<List<DetectedFace>> DetectFaceRecognize(IFaceClient client, string imageUrl, string recognitionModel)
    {
      IList<DetectedFace> detectedFaces = await client.Face.DetectWithUrlAsync(imageUrl, recognitionModel: recognitionModel, detectionModel: DetectionModel.Detection02);
      return detectedFaces.ToList();
    }
  }
}
