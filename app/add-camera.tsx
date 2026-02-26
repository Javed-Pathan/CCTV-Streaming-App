import { saveCamera } from '@/lib/storage';
import { CameraFormData } from '@/types/camera';
import { useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, Camera, Check, Wifi, WifiOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddCameraScreen() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState<CameraFormData>({
    name: 'Cam 1',
    ip: '192.168.1.26',
    port: '554',
    username: 'demo',
    password: 'Demo@123',
    protocol: 'RTSP',
    location: 'Outdoor',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CameraFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CameraFormData, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Camera name is required';
    }

    if (!form.ip.trim()) {
      newErrors.ip = 'IP address is required';
    } else {
      // Basic IP validation
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(form.ip)) {
        newErrors.ip = 'Invalid IP address format';
      }
    }

    if (!form.port.trim()) {
      newErrors.port = 'Port is required';
    } else {
      const portNum = parseInt(form.port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        newErrors.port = 'Port must be between 1 and 65535';
      }
    }

    if (!form.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testConnectivity = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before testing connectivity');
      return;
    }

    setTesting(true);
    setTestResult(null);

    // Simulate connectivity test (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock result: 70% success rate for demo
    const success = Math.random() > 0.3;

    setTesting(false);
    setTestResult(success ? 'success' : 'error');

    if (success) {
      Alert.alert(
        'Connection Successful',
        `Successfully connected to camera at ${form.ip}:${form.port}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Connection Failed',
        'Unable to connect to the camera. Please check:\n\n• IP address and port\n• Network connectivity\n• Camera credentials\n• Firewall settings',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    try {
      // Create camera object with unique ID
      const newCamera = {
        id: Date.now().toString(),
        ...form,
        status: testResult === 'success' ? ('online' as const) : ('offline' as const),
        lastSeen: testResult === 'success' ? 'Just now' : 'Never',
        createdAt: new Date().toISOString(),
      };

      // Save to AsyncStorage
      await saveCamera(newCamera);

      Alert.alert(
        'Camera Added',
        `${form.name} has been added successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save camera. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const updateField = (field: keyof CameraFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Add Camera</Text>
        </View>
        <Camera className="text-primary" size={24} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 128 }}>
        {/* Form Container */}
        <View className="px-6 py-6 gap-5">

          {/* Camera Name */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Camera Name <Text className="text-destructive">*</Text>
            </Text>
            <TextInput
              className={`bg-card border ${errors.name ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3 text-foreground`}
              placeholder="e.g., Front Door Camera"
              placeholderTextColor="#9ca3af"
              value={form.name}
              onChangeText={(text) => updateField('name', text)}
            />
            {errors.name && (
              <View className="flex-row items-center gap-1 mt-1">
                <AlertCircle className="text-destructive" size={14} />
                <Text className="text-destructive text-xs">{errors.name}</Text>
              </View>
            )}
          </View>

          {/* IP Address and Port Row */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">
                IP Address <Text className="text-destructive">*</Text>
              </Text>
              <TextInput
                className={`bg-card border ${errors.ip ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3 text-foreground`}
                placeholder="192.168.1.100"
                placeholderTextColor="#9ca3af"
                value={form.ip}
                onChangeText={(text) => updateField('ip', text)}
                keyboardType="numeric"
              />
              {errors.ip && (
                <View className="flex-row items-center gap-1 mt-1">
                  <AlertCircle className="text-destructive" size={14} />
                  <Text className="text-destructive text-xs">{errors.ip}</Text>
                </View>
              )}
            </View>

            <View style={{ width: 100 }}>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Port <Text className="text-destructive">*</Text>
              </Text>
              <TextInput
                className={`bg-card border ${errors.port ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3 text-foreground`}
                placeholder="554"
                placeholderTextColor="#9ca3af"
                value={form.port}
                onChangeText={(text) => updateField('port', text)}
                keyboardType="numeric"
              />
              {errors.port && (
                <View className="flex-row items-center gap-1 mt-1">
                  <AlertCircle className="text-destructive" size={14} />
                  <Text className="text-destructive text-xs">{errors.port}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Protocol Selection */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Protocol <Text className="text-destructive">*</Text>
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => updateField('protocol', 'RTSP')}
                className={`flex-1 border-2 ${form.protocol === 'RTSP' ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  } rounded-xl py-3 items-center`}
              >
                <Text className={`font-semibold ${form.protocol === 'RTSP' ? 'text-primary' : 'text-muted-foreground'}`}>
                  RTSP
                </Text>
                <Text className={`text-xs mt-1 ${form.protocol === 'RTSP' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Real-Time Streaming
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateField('protocol', 'WebRTC')}
                className={`flex-1 border-2 ${form.protocol === 'WebRTC' ? 'border-primary bg-primary/10' : 'border-border bg-card'
                  } rounded-xl py-3 items-center`}
              >
                <Text className={`font-semibold ${form.protocol === 'WebRTC' ? 'text-primary' : 'text-muted-foreground'}`}>
                  WebRTC
                </Text>
                <Text className={`text-xs mt-1 ${form.protocol === 'WebRTC' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Low Latency
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Username */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Username</Text>
            <TextInput
              className="bg-card border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="admin"
              placeholderTextColor="#9ca3af"
              value={form.username}
              onChangeText={(text) => updateField('username', text)}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Password</Text>
            <View className="relative">
              <TextInput
                className="bg-card border border-border rounded-xl px-4 py-3 text-foreground pr-12"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={form.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3"
              >
                <Text className="text-primary text-sm font-medium">
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Location <Text className="text-destructive">*</Text>
            </Text>
            <TextInput
              className={`bg-card border ${errors.location ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3 text-foreground`}
              placeholder="e.g., Main Entrance, Parking Lot"
              placeholderTextColor="#9ca3af"
              value={form.location}
              onChangeText={(text) => updateField('location', text)}
            />
            {errors.location && (
              <View className="flex-row items-center gap-1 mt-1">
                <AlertCircle className="text-destructive" size={14} />
                <Text className="text-destructive text-xs">{errors.location}</Text>
              </View>
            )}
          </View>

          {/* Test Connectivity Button */}
          <TouchableOpacity
            onPress={testConnectivity}
            disabled={testing}
            className={`border-2 border-dashed ${testResult === 'success' ? 'border-green-500 bg-green-500/10' :
              testResult === 'error' ? 'border-destructive bg-destructive/10' :
                'border-primary bg-primary/5'
              } rounded-xl py-4 items-center`}
          >
            {testing ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="#3b82f6" />
                <Text className="text-primary font-semibold">Testing Connection...</Text>
              </View>
            ) : testResult === 'success' ? (
              <View className="flex-row items-center gap-2">
                <Check className="text-green-500" size={20} />
                <Text className="text-green-500 font-semibold">Connection Successful</Text>
              </View>
            ) : testResult === 'error' ? (
              <View className="flex-row items-center gap-2">
                <WifiOff className="text-destructive" size={20} />
                <Text className="text-destructive font-semibold">Connection Failed</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Wifi className="text-primary" size={20} />
                <Text className="text-primary font-semibold">Test Connectivity</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <View className="flex-row items-start gap-3">
              <AlertCircle className="text-primary mt-0.5" size={18} />
              <View className="flex-1">
                <Text className="text-primary font-semibold text-sm mb-1">Connection Tips</Text>
                <Text className="text-primary/80 text-xs leading-5">
                  • Ensure camera and device are on the same network{'\n'}
                  • Default RTSP port is usually 554{'\n'}
                  • WebRTC typically uses port 8080 or 8443{'\n'}
                  • Check camera documentation for exact settings
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-secondary rounded-xl py-4 items-center"
            >
              <Text className="text-secondary-foreground font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 bg-primary rounded-xl py-4 items-center"
            >
              <Text className="text-primary-foreground font-semibold">Save Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}