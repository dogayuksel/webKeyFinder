#include <emscripten/bind.h>
#include <emscripten/emscripten.h>

#include "../deps/libKeyFinder/src/keyfinder.h"

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

std::vector<float> vectorFromTypedArray(const emscripten::val &typedArray) {
  std::vector<float> vec;
  unsigned int length = typedArray["length"].as<unsigned int>();
  vec.resize(length);

  emscripten::val memoryView {
    emscripten::typed_memory_view(length, vec.data())
  };
  memoryView.call<void>("set", typedArray);
  return vec;
}

// Static because it retains useful resources for repeat use
static KeyFinder::KeyFinder keyFinder;

class KeyFinderInterface {
  KeyFinder::Workspace workspace;
  unsigned int sampleRate;
  int channels;

public:
  KeyFinderInterface(unsigned int inSampleRate, int inChannels) {
    sampleRate = inSampleRate;
    channels = inChannels;
    emscripten_worker_respond_provisionally(0, 0);
  }

  void feedAudioData(emscripten::val input) {
    std::vector<float> samples = vectorFromTypedArray(input);
    const unsigned int length = samples.size();

    KeyFinder::AudioData inputAudio;
    inputAudio.setFrameRate(sampleRate);
    inputAudio.setChannels(channels);
    inputAudio.addToSampleCount(length);

    for (unsigned int i = 0; i < length; i++) {
      inputAudio.setSample(i, static_cast<double>(samples[i]));
    }

    keyFinder.progressiveChromagram(inputAudio, workspace);
    std::string result = getKey(keyFinder.keyOfChromagram(workspace));

    int n = result.length();
    char returnValue[n + 1];
    std::strcpy(returnValue, result.c_str());
    emscripten_worker_respond_provisionally(returnValue, n);
  }

  void finalDetection() {
    keyFinder.finalChromagram(workspace);
    std::string result = getKey(keyFinder.keyOfChromagram(workspace));

    int n = result.length();
    char returnValue[n + 1];
    std::strcpy(returnValue, result.c_str());
    emscripten_worker_respond(returnValue, n);
  }
};

EMSCRIPTEN_BINDINGS(key_finder_interface) {
  emscripten::class_<KeyFinderInterface>("KeyFinderInterface")
    .constructor<unsigned int, int>()
    .function("feedAudioData", &KeyFinderInterface::feedAudioData, emscripten::allow_raw_pointers())
    .function("finalDetection", &KeyFinderInterface::finalDetection);
}
