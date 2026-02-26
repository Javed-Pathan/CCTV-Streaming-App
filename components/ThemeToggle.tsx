import { useColorScheme } from 'nativewind';
import { TouchableOpacity } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_STORAGE_KEY } from './ThemeProvider';

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const toggleTheme = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <TouchableOpacity onPress={toggleTheme}>
      {colorScheme === 'dark' ? (
        <Sun className="text-foreground" size={24} />
      ) : (
        <Moon className="text-foreground" size={24} />
      )}
    </TouchableOpacity>
  );
}
