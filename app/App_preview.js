import * as React from 'react';
import { ScrollView, Image, Button, StyleSheet, Text, View, Alert, TouchableOpacity, Slider, Platform } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Constants from 'expo-constants';
import { Camera } from 'expo-camera'; 
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
//import { width, height, totalSize } from 'react-native-dimension';
import ListItem from './ListItem';


import GalleryScreen from './GalleryScreen';
import isIPhoneX from 'react-native-is-iphonex';

import { 
  Ionicons,
  MaterialIcons,
  Foundation,
  MaterialCommunityIcons,
  Octicons
} from '@expo/vector-icons';
import { emitNotification } from 'expo/build/Notifications/Notifications';

const host = 'http://57b9f852.ngrok.io'

const images = {
  menuOne: require
}

const landmarkSize = 2;

// const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const flashIcons = {
  off: 'flash-off',
  on: 'flash-on',
  auto: 'flash-auto',
  torch: 'highlight'
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

const wbIcons = {
  auto: 'wb-auto',
  sunny: 'wb-sunny',
  cloudy: 'wb-cloudy',
  shadow: 'beach-access',
  fluorescent: 'wb-iridescent',
  incandescent: 'wb-incandescent',
};



const myRed = '#FF6E66';
const styles = StyleSheet.create({
  genericView: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  button: {
    alignItems:'center',
    backgroundColor: myRed,
    width:'100%',
    padding:20,
    maxWidth:400,
    justifyContent:'space-between',
    marginTop:10
  },
  buttonWrapper: {
    alignItems:'center',
    width:'100%',
    marginBottom:80,
    paddingLeft:10,
    paddingRight:10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize:18
  },
  logo: {
    resizeMode:'contain',
    width:290,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Constants.statusBarHeight / 2,
  },
  bottomBar: {
    paddingBottom: isIPhoneX ? 25 : 5,
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    flex: 0.12,
    flexDirection: 'row',
  },
  noPermissions: {
    flex: 1,
    alignItems:'center',
    justifyContent: 'center',
    padding: 10,
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusLabel: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  bottomButton: {
    flex: 0.3, 
    height: 58, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPhotosDot: {
    position: 'absolute',
    top: 0,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4630EB'
  },
  options: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    width: 200,
    height: 160,
    backgroundColor: '#000000BA',
    borderRadius: 4,
    padding: 10,
  },
  detectors: {
    flex: 0.5,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pictureQualityLabel: {
    fontSize: 10,
    marginVertical: 3, 
    color: 'white'
  },
  pictureSizeContainer: {
    flex: 0.5,
    alignItems: 'center',
    paddingTop: 10,
  },
  pictureSizeChooser: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  pictureSizeLabel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  row: {
    flexDirection: 'row',
  },
  detailSheet: {
    alignItems: 'center',
  }
});


class CameraScreen extends React.Component {
  state = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    ratios: [],
    newPhotos: false,
    permissionsGranted: false,
    pictureSize: undefined,
    pictureSizes: [],
    pictureSizeId: 0,
    showGallery: false,
    showMoreOptions: false,
  };

  async UNSAFE_componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permissionsGranted: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatios();
    return ratios;
  };

  toggleView = () => {
                        this.accessCameraRoll();
                        this.setState({ showGallery: !this.state.showGallery, newPhotos: false });
                    };

  toggleMoreOptions = () => this.setState({ showMoreOptions: !this.state.showMoreOptions });

  toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

  toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] });

  setRatio = ratio => this.setState({ ratio });

  toggleWB = () => this.setState({ whiteBalance: wbOrder[this.state.whiteBalance] });

  toggleFocus = () => this.setState({ autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on' });

  zoomOut = () => this.setState({ zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1 });

  zoomIn = () => this.setState({ zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1 });

  setFocusDepth = depth => this.setState({ depth });

  takePicture = () => {
    if (this.camera) {
      var imageObj = this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
      
    }
  };

  accessCameraRoll = async () =>{
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  
        if (status !== 'granted') {
          throw new Error('Denied CAMERA_ROLL permissions!');
        }

  };

  handleMountError = ({ message }) => console.error(message);

  onPictureSaved = async photo => {
    await FileSystem.moveAsync({
      from: photo.uri,
      to: `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`,
    });
    this.setState({ newPhotos: true });
  }

  collectPictureSizes = async () => {
    if (this.camera) {
      const pictureSizes = await this.camera.getAvailablePictureSizesAsync(this.state.ratio);
      let pictureSizeId = 0;
      if (Platform.OS === 'ios') {
        pictureSizeId = pictureSizes.indexOf('High');
      } else {
        // returned array is sorted in ascending order - default size is the largest one
        pictureSizeId = pictureSizes.length-1;
      }
      this.setState({ pictureSizes, pictureSizeId, pictureSize: pictureSizes[pictureSizeId] });
    }
  };

  previousPictureSize = () => this.changePictureSize(1);
  nextPictureSize = () => this.changePictureSize(-1);

  changePictureSize = direction => {
    let newId = this.state.pictureSizeId + direction;
    const length = this.state.pictureSizes.length;
    if (newId >= length) {
      newId = 0;
    } else if (newId < 0) {
      newId = length -1;
    }
    this.setState({ pictureSize: this.state.pictureSizes[newId], pictureSizeId: newId });
  }

  renderGallery() {
    return <GalleryScreen onPress={this.toggleView.bind(this)} />;
  }

  renderNoPermissions = () => 
    <View style={styles.noPermissions}>
      <Text style={{ color: 'white' }}>
        Camera permissions not granted - cannot open camera preview.
      </Text>
    </View>

  renderTopBar = () => 
    <View
      style={styles.topBar}>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFacing}>
        <Ionicons name="ios-reverse-camera" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFlash}>
        <MaterialIcons name={flashIcons[this.state.flash]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleWB}>
        <MaterialIcons name={wbIcons[this.state.whiteBalance]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFocus}>
        <Text style={[styles.autoFocusLabel, { color: this.state.autoFocus === 'on' ? "white" : "#6b6b6b" }]}>AF</Text>
      </TouchableOpacity>   
    </View>

  renderBottomBar = () =>
    <View
      style={styles.bottomBar}>
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleMoreOptions}>
        <Octicons name="kebab-horizontal" size={30} color="white"/>
      </TouchableOpacity>
      <View style={{ flex: 0.4 }}>
        <TouchableOpacity
          onPress={this.takePicture}
          style={{ alignSelf: 'center' }}
        >
          <Ionicons name="ios-radio-button-on" size={70} color="white" />
        </TouchableOpacity>
      </View> 
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleView}>
        <View>
          <Foundation name="thumbnails" size={30} color="white" />
          {this.state.newPhotos && <View style={styles.newPhotosDot}/>}
        </View>
      </TouchableOpacity>
    </View>

  renderMoreOptions = () =>
    (
      <View style={styles.options}>
        <View style={styles.pictureSizeContainer}>
          <Text style={styles.pictureQualityLabel}>Picture quality</Text>
          <View style={styles.pictureSizeChooser}>
            <TouchableOpacity onPress={this.previousPictureSize} style={{ padding: 6 }}>
              <Ionicons name="md-arrow-dropleft" size={14} color="white" />
            </TouchableOpacity>
            <View style={styles.pictureSizeLabel}>
              <Text style={{color: 'white'}}>{this.state.pictureSize}</Text>
            </View>
            <TouchableOpacity onPress={this.nextPictureSize} style={{ padding: 6 }}>
              <Ionicons name="md-arrow-dropright" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View> 
    );

  renderCamera = () =>
    (
      <View style={{ flex: 1 }}>
        <Camera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.camera}
          onCameraReady={this.collectPictureSizes}
          type={this.state.type}
          flashMode={this.state.flash}
          autoFocus={this.state.autoFocus}
          zoom={this.state.zoom}
          whiteBalance={this.state.whiteBalance}
          ratio={this.state.ratio}
          pictureSize={this.state.pictureSize}
          onMountError={this.handleMountError}
          >
          {this.renderTopBar()}
          {this.renderBottomBar()}
        </Camera>
        {this.state.showMoreOptions && this.renderMoreOptions()}
      </View>
    );

  render() {
    const cameraScreenContent = this.state.permissionsGranted
      ? this.renderCamera()
      : this.renderNoPermissions();
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;
    return <View style={styles.container}>{content}</View>;
  }
}


class HomeScreen extends React.Component{
  render(){
    return (
      <View style = {styles.genericView}>

        <Image style={styles.logo} source={require('./assets/logo.png')} />

        <View style = {styles.buttonWrapper}>
          <TouchableOpacity style={styles.button}
            onPress = {() => this.props.navigation.navigate('CameraScreen')}
          >
            <Text style={styles.buttonText}>Take Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
            onPress = {() => this.props.navigation.navigate('UploadPicture')}
          >
            <Text style={styles.buttonText}>Upload Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
            onPress = {() => this.props.navigation.navigate('Preview', {menuId:1,})}
          >
            <Text style={styles.buttonText}>See an Example</Text>
          </TouchableOpacity>
        </View>

        {/* <Button
        title="Sample Menu 2"
        onPress = {() => this.props.navigation.navigate('Preview', {menuId:2,})}
        />
        <Button
        title="Sample Menu 3"
        onPress = {() => this.props.navigation.navigate('Preview', {menuId:3,})}
        /> */}
      </View>
    );
  }
}

const previewStyles = StyleSheet.create({
  buttonWrapper: {
    // alignItems:'center',
    // width:'100%',
    // marginBottom:-30,
    // paddingLeft:10,
    // paddingRight:10,
  },
})

class Preview extends React.Component {
  static navigationOptions = ({ navigation }) => { title: 'Preview' };

  chooseMenu = (menuNum) => {
    if(menuNum == 1){
      return require('./menus/simple-mexican-menu.jpeg');
    } else if (menuNum == 2){
      return require('./menus/wine-list.jpeg');
    } else {
      return require('./menus/mexican_menu.jpeg');
    }
  }  

  state = {
    boxes: [
      {top:  0,  left:  0,  right: 10, bottom: 10},
      {top:  30, left:  30, right: 70, bottom: 45},
      {top:  0,  left:  20, right: 30, bottom: 10},
      {top:  90, left:  90, right: 100, bottom: 100}
    ]
  }

  render(){
    const { navigation } = this.props;
    var menuPath = this.chooseMenu(navigation.getParam('menuId'))
    // menuPath = require('./menus/wine-list.jpeg');
    return (
      <View title = "Preview" 
      style = {styles.genericView}
      > 
      <View style = {{ 
        height: 500, 
        width: 400, 
        backgroundColor:'#00FF00', 
        borderColor:'#000000', 
        borderWidth:3
      }}>
        <Image style={{
          position:'absolute',
          top:0,
          left:0,
          width:'100%',
          height:'100%',
          resizeMode: 'stretch',
          margin:0,
          padding:0,
        }} source = {menuPath} />

        {
          this.state.boxes.map((box) => (
            <View style={{
              position:'absolute',
              top: `${box.top}%`,
              left:`${box.left}%`,
              borderColor:'#FF0000',
              borderWidth:2,
              width:`${box.right-box.left}%`,
              height:`${box.bottom-box.top}%`,
            }}></View>
          ))
        }
      </View>
      <View style={styles.buttonWrapper, previewStyles.buttonWrapper}>
        <TouchableOpacity 
          style={styles.button}
          onPress= {() => {
            this.props.navigation.navigate('MenuList', {
              menuType:'example', 
              menuId:this.props.navigation.getParam('menuId')}
            );
          }}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        </View>
      </View>
    );
  }
}


class MenuList extends React.Component{
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Menu Items'
    };
  };
  state = {
    // data: {item_list: ["Scrambled Eggs"]}
    data: {item_list: ["Loading..."]}
  }
  componentDidMount() {
    if(this.props.navigation.getParam('menuType') == 'example') {
      let menuId = this.props.navigation.getParam('menuId');

      let formData = new FormData();
      formData.append('menu_id', menuId);
      fetch(`${host}/ocr`, {
        method:'POST',
        body: formData
      })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        this.setState({data: data});
      })
      .catch((error) => {
        console.error(error);
      });
      // this.setState({names:["Huevos ocn Chariz", "Migas con Huev", "Beef Burrit", "Barbacoa Burrit", "Fiesta Chicken Burrito ", "Vegetarian Burrito ", "Smothered Burrito ", "Carne Asada Plate ", "Quesadilla ", "Carne Asada Steak "]});
    }
  }

  render(){
    return(
      <ScrollView>
      {this.state.data.item_list.map((name, i) => 
        (<ListItem key={name} navigation={this.props.navigation} menuItemName={name} listParity={i%2} />)
      )}
      </ScrollView>
    );
  }
}

class Details extends React.Component{

  state = {
    data: { image_url: '', image_url: '', description:'' },
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('keyword')
    };
  };

  componentDidMount() {
    let formData = new FormData();
    console.log(this.props.menuItemName);
    formData.append('name', this.props.navigation.getParam('menuItemName', 'scrambled eggs'));

    fetch(`${host}/info`, {
      method:'POST',
      body: formData
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
      this.setState({data: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }
  render(){

    let { navigation } = this.props;

    return(
      <ScrollView contentContainerStyle={{alignItems:'center'}}> 
      <Text style = {{alignItems: 'center', justifyContent: 'center'}}>{this.state.data.title}</Text>
      <Image
      source = {{uri: this.state.data.image_url}}
      style = {{resizeMode: 'contain', width: 150, height: 150, alignItems: 'center',}}
      />
      <Text style = {{flex:1, alignItems: 'center', justifyContent: 'center'}}>{this.state.data.description}</Text>
      </ScrollView>
      );
  }
}

class UploadPicture extends React.Component{
  render(){
    return(
      <View style = {{alignItems: 'center', justifyContent: 'center'}}>
      <Text>Upload Picture</Text>
      </View>
    );
  }
}

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerShown:false,
    }
  },
  CameraScreen:{
    screen: CameraScreen,
    navigationOptions: {
      headerShown:false,
    }
  },
  UploadPicture:{
    screen: UploadPicture,
    navigationOptions: {
      headerShown:false,
    }
  },
  Preview:{
    screen: Preview,
    navigationOptions: {
      headerShown:false,
    }
  },
  MenuList:{
    screen: MenuList,
    navigationOptions: {
      headerStyle: {
        backgroundColor:myRed,
        // headerTintColor:'#FFFFFF',
      },
      headerTitleStyle: {
        fontWeight:'normal',
        color:'#FFFFFF'
      }
      // headerShown:false,
    }
  },
  Details:{
    screen: Details,
    navigationOptions: {
      headerStyle: {
        backgroundColor:myRed,
        // headerTintColor:'#FFFFFF',
      },
      headerTitleStyle: {
        fontWeight:'normal',
        color:'#FFFFFF'
      }
      // headerShown:false,
    }
  },
},{
  initialRouteName: 'Home',
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}