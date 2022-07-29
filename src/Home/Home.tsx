import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { categories } from "./categories";
import { dbFetch } from './dbFetch';

export interface IMarker {
  category: string;
  contact: string;
  description: string;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
}

export default function Home() {
  const [markers, setMarkers] = useState<IMarker[]>([]);
  const [filter, setFilter] = useState("");
  const [position, setPosition] = useState({
    latitude: -23.54157184424356,
    longitude: -46.60749944090844,
  });
  const [destination, setDestination] = useState({
    latitude: -23.54157184424356,
    longitude: -46.60749944090844,
  });
  const [visible, setVisible] = useState(false);

  const navigation = useNavigation();
  const filteredData = markers.filter((m) => m.category === filter);

  useEffect(() => {
    setMarkers(dbFetch);
  }, []);

  if (!markers || markers.length === 0) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Bem vindo</Text>
        <Text style={styles.subTitle}>
          Encontre no mapa um ponto do comércio local
        </Text>
      </View>

      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude: markers[0].latitude,
          longitude: markers[0].longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          pinColor='green'
          coordinate={position}
        />
        {(filter ? filteredData : markers).map((item) => {
          return (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              onPress={() => {
                setDestination({
                  latitude: item.latitude,
                  longitude: item.longitude,
                });
                setVisible(true);
              }}
            />
          );
        })}
        {
          visible ?
            <Polyline
              coordinates={[position, destination]}
              strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
              strokeColors={['#7F0000']}
              strokeWidth={6}
            />
            : null
        }
      </MapView>

      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          contentContainerStyle={{
            alignItems: "center",
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setFilter(filter === item.key ? "" : item.key);
              }}
              style={[
                styles.categoryItem,
                filter === item.key ? styles.selectedCategory : null,
              ]}
              key={item.key}
            >
              <Image style={styles.categoryImage} source={item.image} />
              <Text style={styles.categoryText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 20,
    paddingTop: Platform.OS === "android" ? 50 : 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    color: "#322153",
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6c6c80",
  },
  map: {
    flex: 1,
  },
  categoryContainer: {
    padding: 10,
  },
  categoryItem: {
    height: 110,
    backgroundColor: "#f0f0f5",
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  categoryImage: {
    width: 50,
    height: 50,
  },
  categoryText: {
    textAlign: "center",
    color: "#6c6c80",
  },
  selectedCategory: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#322153",
  },
});
