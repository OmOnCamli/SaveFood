import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { DataService, Product } from '../../services/data';

export default function HomeScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        setRefreshing(true);
        const data = await DataService.getProducts();
        setProducts(data.filter(p => p.available));
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleBuy = async (item: Product) => {
        Alert.alert("Confirm Purchase", `Buy ${item.title} for ${item.price} TL?`, [
            { text: "Cancel" },
            {
                text: "Buy", onPress: async () => {
                    await DataService.purchaseProduct(item.id);
                    Alert.alert("Success", "You have rescued this meal! Go to the restaurant to pick it up.");
                    loadData();
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.card}>
            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.cardImage} /> : null}
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <ThemedText type="subtitle">{item.title}</ThemedText>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Rescued</Text>
                    </View>
                </View>
                {/* <Text style={styles.restaurantName}>{item.businessId}</Text> */}
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                <View style={styles.priceRow}>
                    <View>
                        {item.originalPrice && <Text style={styles.originalPrice}>{item.originalPrice} TL</Text>}
                        <ThemedText type="title" style={{ color: '#2e7d32' }}>{item.price} TL</ThemedText>
                    </View>
                    <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
                        <Text style={styles.buyButtonText}>RESCUE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Food Rescue</ThemedText>
                <Ionicons name="filter" size={24} color="gray" />
            </View>
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadData} />
                }
                ListEmptyComponent={<Text style={{ padding: 20, textAlign: 'center' }}>No food available right now. Check back later!</Text>}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 150,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    restaurantName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#444',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#ff4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: '#888',
        fontSize: 14,
    },
    buyButton: {
        backgroundColor: '#2e7d32',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    buyButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
