import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f4f9f4',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    marginVertical: 20,
    textAlign: 'center',
  },
  card: {
    padding: 25,
    marginVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  maxHeartRateContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  textInput: {
    width: '50%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 10,
  },
  alert: {
    padding: 18,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
    maxWidth: 350,
  },
  map: {
    width: 300,
    height: 300,
    marginTop: 10,
  },
});

export default styles;
