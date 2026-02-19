import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { authStyles } from '../styles/authStyles';

const AuthForm = ({ 
    title, 
    subTitle,
    error, 
    onSubmit, 
    loading, 
    buttonText, 
    children,
    footer,
    style
}) => {
    return (
        <View style={[authStyles.card, style]}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={authStyles.title}>{title}</Text>
                {subTitle && <Text style={{ fontSize: 14, color: '#666', marginTop: 5 }}>{subTitle}</Text>}
            </View>
            
            {error ? <Text style={authStyles.errorText}>{error}</Text> : null}

            {children}

            <TouchableOpacity 
                style={authStyles.button}
                onPress={onSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={authStyles.buttonText}>{buttonText}</Text>
                )}
            </TouchableOpacity>

            {footer}
        </View>
    );
};

export default AuthForm;
