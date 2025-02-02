import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';

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

const getRandomImage = () => images[Math.floor(Math.random() * images.length)];

export default function App() {
  const [joyaux, setJoyaux] = useState(generateGrid());
  const [selectedIndex, setSelectedIndex] = useState(null);

  const isAdjacent = (index1, index2) => {
    if (index1 === null || index2 === null) return false;
    const row1 = Math.floor(index1 / 8);
    const col1 = index1 % 8;
    const row2 = Math.floor(index2 / 8);
    const col2 = index2 % 8;
    return (Math.abs(row1 - row2) === 1 && col1 === col2) || (Math.abs(col1 - col2) === 1 && row1 === row2);
  };

  const detectMatches = (grid) => {
    let matchedIndices = new Set();

  
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 6; col++) {
        let index = row * 8 + col;
        if (grid[index] === grid[index + 1] && grid[index] === grid[index + 2]) {
          matchedIndices.add(index);
          matchedIndices.add(index + 1);
          matchedIndices.add(index + 2);
        }
      }
    }


    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 6; row++) {
        let index = row * 8 + col;
        if (grid[index] === grid[index + 8] && grid[index] === grid[index + 16]) {
          matchedIndices.add(index);
          matchedIndices.add(index + 8);
          matchedIndices.add(index + 16);
        }
      }
    }

    return matchedIndices;
  };

  const handleImageClick = (index) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else {
      if (isAdjacent(selectedIndex, index)) {
        const newJoyaux = [...joyaux];
        [newJoyaux[selectedIndex], newJoyaux[index]] = [newJoyaux[index], newJoyaux[selectedIndex]];

        let matches = detectMatches(newJoyaux);
        while (matches.size > 0) {
          matches.forEach(idx => newJoyaux[idx] = null);
          matches = detectMatches(newJoyaux);
        }

        setJoyaux(newJoyaux);
      }
      setSelectedIndex(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BEJEWELED</Text>
      <View style={styles.gridContainer}>
        <FlatList
          data={joyaux}
          numColumns={8}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => handleImageClick(index)}>
              {item && <Image style={[styles.image, selectedIndex === index ? styles.selected : {}]} source={item} resizeMode="center" />}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
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
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'blue',
    textAlign: 'center',
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
    borderColor: 'black'
  },
  imageselectionne: {
    borderColor: 'red',
    borderWidth: 3,
  },
});
