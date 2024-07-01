import AsyncStorage from "@react-native-async-storage/async-storage";

import { PLAYER_COLLECTION, GROUP_COLLECTION } from "@storage/storageConfig";

import { groupsGetAll } from "./groupsGetAll";


export async function groupDeleteByName(groupDeleted:string){
try {
    const storedGroups = await groupsGetAll()

    const filtered = storedGroups.filter(group => group != groupDeleted);

    await AsyncStorage.setItem(GROUP_COLLECTION, JSON.stringify(filtered));
    
    await AsyncStorage.removeItem(`${PLAYER_COLLECTION}-${groupDeleted}`)
    

} catch (error) {
   throw error 
}

}