import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { DataService, Product } from '../../services/data';

export default function MapScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        DataService.getProducts().then(setProducts);
    };

    const handleCalloutPress = (product: Product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const handleBuy = async () => {
        if (!selectedProduct) return;
        await DataService.purchaseProduct(selectedProduct.id);
        Alert.alert("Success", `You purchased ${selectedProduct.title}!`);
        setModalVisible(false);
        loadProducts(); // Refresh map
    };

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                <View style={styles.webFallback}><Text>Map not supported in web preview (requires API Key). Runs on Device.</Text></View>
            ) : (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 41.0082,
                        longitude: 28.9784,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {products.map((product) => (
                        product.available && (
                            <Marker
                                key={product.id}
                                coordinate={{ latitude: product.latitude, longitude: product.longitude }}
                                title={product.title}
                                description={`${product.price} TL`}
                            >
                                <View style={styles.markerContainer}>
                                    <Ionicons name="fast-food" size={20} color="white" />
                                </View>
                                <Callout onPress={() => handleCalloutPress(product)}>
                                    <View style={styles.callout}>
                                        <Text style={styles.calloutTitle}>{product.title}</Text>
                                        <Text>{product.description.slice(0, 20)}...</Text>
                                        <Text style={styles.calloutPrice}>{product.price} TL</Text>
                                        <Text style={styles.clickHint}>(Tap for details)</Text>
                                    </View>
                                </Callout>
                            </Marker>
                        )
                    ))}
                </MapView>
            )}

            {/* Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedProduct && (
                            <>
                                <View style={styles.modalHeader}>
                                    {/* Using Title as header since Restaurant Name is not in new schema */}
                                    <Text style={styles.modalTitle}>{selectedProduct.title}</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="black" />
                                    </TouchableOpacity>
                                </View>

                                {selectedProduct.imageUrl ? (
                                    <Image source={{ uri: selectedProduct.imageUrl }} style={styles.productImage} />
                                ) : null}

                                <Text style={styles.addressText}>{selectedProduct.address}</Text>
                                <Text style={styles.productDesc}>{selectedProduct.description}</Text>

                                <View style={styles.priceRow}>
                                    {selectedProduct.originalPrice && (
                                        <Text style={styles.originalPrice}>{selectedProduct.originalPrice} TL</Text>
                                    )}
                                    <Text style={styles.discountedPrice}>{selectedProduct.price} TL</Text>
                                </View>

                                <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
                                    <Text style={styles.buyButtonText}>PAY NOW</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    webFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    markerContainer: {
        backgroundColor: '#2e7d32',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white'
    },
    callout: {
        padding: 5,
        width: 150,
        alignItems: 'center'
    },
    calloutTitle: {
        fontWeight: 'bold',
        marginBottom: 2
    },
    calloutPrice: {
        color: 'green',
        fontWeight: 'bold',
        marginTop: 2
    },
    clickHint: {
        fontSize: 10,
        color: 'gray',
        marginTop: 2
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    productImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 15
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5
    },
    addressText: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
        fontStyle: 'italic'
    },
    productDesc: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: 'gray',
        marginRight: 10,
        fontSize: 16
    },
    discountedPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2e7d32'
    },
    buyButton: {
        backgroundColor: '#2e7d32',
        padding: 15,
        borderRadius: 30,
        alignItems: 'center'
    },
    buyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});
