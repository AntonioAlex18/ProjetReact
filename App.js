import React, { useState, useEffect } from 'react';
import { FlatList, Image, StyleSheet, View, Text, TouchableOpacity, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const images = [
  require('./assets/images/bleu.png'),
  require('./assets/images/jaune.png'),
  require('./assets/images/orange.png'),
  require('./assets/images/rose.png'),
  require('./assets/images/rouge.png'),
  require('./assets/images/turquoise.png'),
  require('./assets/images/vert.png'),
  require('./assets/images/violet.png'),
];

const cardBack = require('./assets/images/dosdecarte.png');

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const generateGrid = () => {
  let grid = [];
  for (let i = 0; i < 64; i++) {
    grid.push(images[i % images.length]);
  }
  return shuffleArray(grid);
};

const detectMatches = (grid) => {
  let matchedIndices = new Set();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 6; col++) {
      let index = row * 8 + col;
      if (grid[index] && grid[index] === grid[index + 1] && grid[index] === grid[index + 2]) {
        matchedIndices.add(index);
        matchedIndices.add(index + 1);
        matchedIndices.add(index + 2);
      }
    }
  }

  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 6; row++) {
      let index = row * 8 + col;
      if (grid[index] && grid[index] === grid[index + 8] && grid[index] === grid[index + 16]) {
        matchedIndices.add(index);
        matchedIndices.add(index + 8);
        matchedIndices.add(index + 16);
      }
    }
  }

  return matchedIndices;
};

export default function App() {
  const [joyaux, setJoyaux] = useState(generateGrid());
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lastMatchTime, setLastMatchTime] = useState(Date.now()); // suivi du dernier match

  const isAdjacent = (index1, index2) => {
    if (index1 === null || index2 === null) return false;
    const row1 = Math.floor(index1 / 8);
    const col1 = index1 % 8;
    const row2 = Math.floor(index2 / 8);
    const col2 = index2 % 8;
    return (Math.abs(row1 - row2) === 1 && col1 === col2) || (Math.abs(col1 - col2) === 1 && row1 === row2); // vérification des matchs
  };

  const handleImageClick = (index) => {
    if (paused) return;
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else {
      if (isAdjacent(selectedIndex, index)) {
        const newJoyaux = [...joyaux];
        [newJoyaux[selectedIndex], newJoyaux[index]] = [newJoyaux[index], newJoyaux[selectedIndex]];

        let matches = detectMatches(newJoyaux);
        if (matches.size > 0) {
          setScore((prevScore) => prevScore + matches.size * 10);
          setLastMatchTime(Date.now()); // Dernier match en temps
          while (matches.size > 0) {
            matches.forEach(idx => newJoyaux[idx] = getRandomImage());
            matches = detectMatches(newJoyaux);
          }
          setJoyaux(newJoyaux);
        } else {
          [newJoyaux[selectedIndex], newJoyaux[index]] = [newJoyaux[index], newJoyaux[selectedIndex]];
          setScore((prevScore) => prevScore - 5);
          setJoyaux(newJoyaux);
        }
      }
      setSelectedIndex(null);
    }
  };

  const handleReplay = () => {
    setJoyaux(generateGrid());
    setScore(0);
    setLastMatchTime(Date.now());
  };

  const togglePause = () => {
    setPaused(!paused);
  };

  const getRandomImage = () => images[Math.floor(Math.random() * images.length)];

  const getLevel = () => {
    return Math.floor(score / 100) + 1; // Score /100 = lvl pour simplifier
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const timeDiff = (currentTime - lastMatchTime) / 1000;

      if (timeDiff >= 10) {
        setScore((prevScore) => Math.max(prevScore - 50, 0));
        setLastMatchTime(currentTime); // -50 points si pas de match et RESET du timer
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastMatchTime]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BEJEWELED</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>Score: {score}</Text>
      </View>
      <View style={styles.levelContainer}>
        <Text style={styles.level}>Level: {getLevel()}</Text> {/* Niveau affiché ici */}
      </View>
      <View style={styles.gridContainer}>
        <FlatList
          data={joyaux}
          numColumns={8}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => handleImageClick(index)}>
              <Image style={[styles.image, selectedIndex === index ? styles.selected : {}]} source={paused ? cardBack : item} resizeMode="center" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
      <TouchableHighlight style={styles.pauseButton} onPress={togglePause} underlayColor="#0000cc">
        <Icon name={paused ? 'play' : 'pause'} size={20} color="white" />
      </TouchableHighlight>
      <TouchableHighlight style={styles.replayButton} onPress={handleReplay} underlayColor="#0000cc">
        <Text style={styles.replayButtonText}>Rejouer</Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'blue',
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'green',
  },
  levelContainer: {
    marginBottom: 20, // Ajout d'un espacement avant le bouton de pause
  },
  level: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
  },
  gridContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 500,
    height: 500,
  },
  flatListContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: 'black',
  },
  selected: {
    borderColor: 'red',
    borderWidth: 3,
  },
  replayButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: 'blue',
    borderRadius: 20,
  },
  pauseButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'blue',
    borderRadius: 20,
  },
  replayButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
