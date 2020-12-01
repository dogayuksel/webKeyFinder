#include <emscripten/emscripten.h>

#include "../../libKeyFinder/keyfinder.h"

// Static because it retains useful resources for repeat use
static KeyFinder::KeyFinder k;

std::string getKey(KeyFinder::key_t key) {
  switch(key)
    {
    case KeyFinder::A_MAJOR:      return "A Major";
    case KeyFinder::A_MINOR:      return "A Minor";
    case KeyFinder::B_FLAT_MAJOR: return "Bb Major";
    case KeyFinder::B_FLAT_MINOR: return "Bb Minor";
    case KeyFinder::B_MAJOR:      return "B Major";
    case KeyFinder::B_MINOR:      return "B Minor";
    case KeyFinder::C_MAJOR:      return "C Major";
    case KeyFinder::C_MINOR:      return "C Minor";
    case KeyFinder::D_FLAT_MAJOR: return "Db Major";
    case KeyFinder::D_FLAT_MINOR: return "Db Minor";
    case KeyFinder::D_MAJOR:      return "D Major";
    case KeyFinder::D_MINOR:      return "D Minor";
    case KeyFinder::E_FLAT_MAJOR: return "Eb Major";
    case KeyFinder::E_FLAT_MINOR: return "Eb Minor";
    case KeyFinder::E_MAJOR:      return "E Major";
    case KeyFinder::E_MINOR:      return "E Minor";
    case KeyFinder::F_MAJOR:      return "F Major";
    case KeyFinder::F_MINOR:      return "F Minor";
    case KeyFinder::G_FLAT_MAJOR: return "Gb Major";
    case KeyFinder::G_FLAT_MINOR: return "Gb Minor";
    case KeyFinder::G_MAJOR:      return "G Major";
    case KeyFinder::G_MINOR:      return "G Minor";
    case KeyFinder::A_FLAT_MAJOR: return "Ab Major";
    case KeyFinder::A_FLAT_MINOR: return "Ab Minor";
    case KeyFinder::SILENCE:      return "Silence";
    default:                      return "Unknown";
    }
}

void printKey(KeyFinder::key_t key) {
  printf("%s\n", getKey(key).c_str());
}

extern "C" {

  void runFindKey(float samples[], int length, int channels, int sampleRate) {
    printf("heere in the worker\n");
    KeyFinder::AudioData inputAudio;

    inputAudio.setFrameRate(sampleRate);
    inputAudio.setChannels(channels);
    inputAudio.addToSampleCount(length);

    int segmentLength = length / channels;

    for (unsigned int i = 0; i < segmentLength; i++) {
      for (unsigned int j = 0; j < channels; j ++) {
        inputAudio.setSample(i+j, static_cast<double>(samples[i + j * segmentLength]));
      }
    }

    std::string result = getKey(k.keyOfAudio(inputAudio));
    printf("Final key is: %s\n", result.c_str());

    int n = result.length();
    char returnValue[n + 1];
    std::strcpy(returnValue, result.c_str());
    emscripten_worker_respond(returnValue, n);
  }
}
