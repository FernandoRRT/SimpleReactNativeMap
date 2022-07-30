import React, { useState, useEffect, useRef } from "react";
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
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { ICoordinate, IMarker } from "../helpers/interfaces";
import { categories } from "../services/categories";
import { dbFetch } from '../services/dbFetch';

export default function Home() {

  const [markers, setMarkers] = useState<IMarker[]>([]);

  useEffect(() => {
    setMarkers(dbFetch);
  }, [dbFetch])

  const [filter, setFilter] = useState("");
  const position: ICoordinate = {
    latitude: -23.54157184424356,
    longitude: -46.60749944090844,
  };
  const [destination, setDestination] = useState<ICoordinate>(position);
  const [distance, setDistance] = useState<number>();
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [showCallout, setShowCallout] = useState<boolean>(false);

  const myAppKey = "YourAPIKey";
  const mapEl = useRef<MapView | null>();

  const filteredData = markers.filter((m) => m.category === filter);

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
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        ref={ref => { mapEl.current = ref as MapView }}
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
                setShowDirections(true);
                setShowCallout(true);
              }}
            />
          );
        })}
        {showDirections &&
          <MapViewDirections
            origin={position}
            destination={destination}
            apikey={myAppKey}
            strokeWidth={4}
            strokeColor="#111111"

            onReady={result => {
              setDistance(result.distance);
              mapEl.current?.fitToCoordinates(
                result.coordinates, {
                edgePadding: {
                  top: 50,
                  right: 50,
                  bottom: 50,
                  left: 50,
                }
              }
              )
            }}
          />
        }
      </MapView>
      {showCallout &&
        <View style={styles.calloutView}>
          <Text style={styles.calloutText}>Total distance: {distance} Km</Text>
        </View>
      }
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
                setDestination(position);
                setShowDirections(false);
                setShowCallout(false);

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
  calloutView: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#322153",
    padding: 10,
  },
  calloutText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 18,
    color: "#6c6c80",
  },
});
