import React from 'react';
import { View, StyleSheet, Text, TextInput, Button } from 'react-native';
import { open } from '@op-engineering/op-sqlite';
import { HotUpdater } from '@hot-updater/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NativeLocalStorage from './specs/NativeLocalStorage';

export const db = open({
  name: 'demo.db',
});

const EMPTY = '<empty>';

function App(): React.JSX.Element {
  const [value, setValue] = React.useState<string | null>(null);

  const [editingValue, setEditingValue] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedValue = NativeLocalStorage?.getItem('myKey');
    setValue(storedValue ?? '');
    createTable();
  }, []);

  const createTable = () => {
    db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER
      );
    `);
  };

  const addData = () => {
    db.execute('INSERT INTO users (name, age) VALUES (?, ?)', ['Cuong', 30]);
  };

  const queryData = async () => {
    const result = await db.execute('SELECT * FROM users');

    console.log(result.rows);
  };

  const handleBatchInsert = () => {
    db.executeBatch([
      ['INSERT INTO users (name, age) VALUES (?, ?)', ['A', 20]],
      ['INSERT INTO users (name, age) VALUES (?, ?)', ['B', 21]],
    ]);
  };

  const handleLargeQuery = () => {
    for (let i = 0; i < 10000; i++) {
      db.execute('INSERT INTO users (name, age) VALUES (?, ?)', [`User ${i}`, i]);
    }
  };

  const deleteDB = () => {
    db.close();
    db.delete();
  };

  function saveValue() {
    NativeLocalStorage?.setItem(editingValue ?? EMPTY, 'myKey');
    setValue(editingValue);
  }

  function clearAll() {
    NativeLocalStorage?.clear();
    setValue('');
  }

  function deleteValue() {
    NativeLocalStorage?.removeItem('myKey');
    setValue('');
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.text}>Current stored value is: {value ?? 'No Value'}</Text>
      <TextInput
        placeholder='Enter the text you want to store'
        style={styles.textInput}
        onChangeText={setEditingValue}
      />
      <Button title='Save' onPress={saveValue} />
      <Button title='Delete' onPress={deleteValue} />
      <Button title='Clear' onPress={clearAll} />
      <Button title='Add Data' onPress={addData} />
      <Button title='Query Data' onPress={queryData} />
      <Button title='Batch Insert' onPress={handleBatchInsert} />
      <Button title='Large Query' onPress={handleLargeQuery} />
      <Button title='Delete DB' onPress={deleteDB} />
    </SafeAreaView>
  );
}

export default HotUpdater.wrap({
  baseURL: 'https://hot-updater.cuong-nguyen-beb.workers.dev/api/check-update',
  updateStrategy: 'appVersion', // or "fingerprint"
  requestHeaders: {
    // if you want to use the request headers, you can add them here
  },
  fallbackComponent: ({ progress, status }) => (
    <View style={styles.fallbackContainer}>
      {/* You can put a splash image here. */}
      <Text style={styles.fallbackTitle}>
        {status === 'UPDATING' ? 'Updating...' : 'Checking for Update...'}
      </Text>
      {progress > 0 ? (
        <Text style={styles.fallbackTitle}>{Math.round(progress * 100)}%</Text>
      ) : null}
    </View>
  ),
})(App);

const styles = StyleSheet.create({
  text: {
    margin: 10,
    fontSize: 20,
  },
  textInput: {
    margin: 10,
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
  },
  fallbackContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fallbackTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
