import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { DataService, User } from '../../services/data';

export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [isBusiness, setIsBusiness] = useState(false);

    // Business Form State
    const [prodName, setProdName] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodAddress, setProdAddress] = useState('');

    useEffect(() => {
        DataService.getCurrentUser().then(u => {
            setUser(u);
            setIsBusiness(u?.role === 'business');
        });
    }, []);

    const toggleRole = async (value: boolean) => {
        setIsBusiness(value);
        const newUser = await DataService.switchRole(value ? 'business' : 'consumer');
        setUser(newUser);
    };

    const handleAddProduct = async () => {
        if (!prodName || !prodPrice || !prodAddress) {
            Alert.alert("Missing Fields", "Please fill in Name, Price, and Address.");
            return;
        }

        try {
            await DataService.addProduct({
                title: prodName,
                description: prodDesc || 'Delicious food rescue.',
                price: parseFloat(prodPrice),
                businessId: user?.id || 'biz1',
                // restaurantName: user?.name || 'My Restaurant', // Removed from simplified interface, usage depends on businessId or fetching
                address: prodAddress,
                available: true
            });

            Alert.alert("Success", "Product added to the marketplace!");
            setProdName('');
            setProdPrice('');
            setProdDesc('');
            setProdAddress('');
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not add product.");
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Profile</ThemedText>
            </View>

            <View style={styles.section}>
                <ThemedText type="subtitle">User Settings</ThemedText>

                <View style={styles.roleContainer}>
                    <TouchableOpacity
                        style={[styles.roleBox, !isBusiness && styles.roleBoxActive]}
                        onPress={() => toggleRole(false)}
                    >
                        <ThemedText style={[styles.roleText, !isBusiness && styles.roleTextActive]}>Consumer</ThemedText>
                        <ThemedText style={{ fontSize: 10, color: !isBusiness ? 'white' : 'gray' }}>Buy Food</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.roleBox, isBusiness && styles.roleBoxActive]}
                        onPress={() => toggleRole(true)}
                    >
                        <ThemedText style={[styles.roleText, isBusiness && styles.roleTextActive]}>Business</ThemedText>
                        <ThemedText style={{ fontSize: 10, color: isBusiness ? 'white' : 'gray' }}>Sell Food</ThemedText>
                    </TouchableOpacity>
                </View>

            </View>

            {isBusiness && (
                <ScrollView style={styles.section}>
                    <ThemedText type="subtitle">Add New Product</ThemedText>
                    <View style={styles.form}>
                        <ThemedText>Product Name</ThemedText>
                        <TextInput style={styles.input} value={prodName} onChangeText={setProdName} placeholder="e.g. Leftover Soup" />

                        <ThemedText>Discounted Price (TL)</ThemedText>
                        <TextInput style={styles.input} value={prodPrice} onChangeText={setProdPrice} keyboardType="numeric" placeholder="50" />

                        <ThemedText>Address</ThemedText>
                        <TextInput style={styles.input} value={prodAddress} onChangeText={setProdAddress} placeholder="e.g. Taksim Square" />

                        <ThemedText>Description</ThemedText>
                        <TextInput style={styles.input} value={prodDesc} onChangeText={setProdDesc} placeholder="Description..." />

                        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>ADD LISTING</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {!isBusiness && (
                <View style={styles.section}>
                    <ThemedText>History</ThemedText>
                    <ThemedText style={{ color: 'gray', marginTop: 10 }}>No purchase history yet.</ThemedText>
                </View>
            )}

        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 30,
    },
    section: {
        marginBottom: 30,
    },
    // Redesigned Role Switcher
    roleContainer: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 15
    },
    roleBox: {
        flex: 1,
        padding: 20,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent'
    },
    roleBoxActive: {
        backgroundColor: '#2e7d32', // Green for active
        borderColor: '#1b5e20'
    },
    roleText: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    roleTextActive: {
        color: 'white'
    },
    // End Redesign
    form: {
        marginTop: 10,
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
    },
    input: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    addButton: {
        backgroundColor: '#2e7d32',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    }
});
