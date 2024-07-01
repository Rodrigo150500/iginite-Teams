import { useEffect, useRef, useState } from 'react';
import { FlatList, Alert, TextInput} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native';

import { playerAddByGroup } from '@storage/player/playerAddByGroup';
import {playerGetByGroupAndTeam} from '@storage/player/playerGetByGroupAndTeam';
import { playerRemoveByGroup } from '@storage/player/playerRemoveByGroup';
import { groupDeleteByName } from '@storage/group/groupDeleteByName';

import { AppError } from '@utils/AppError';


import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { ButtonIcon } from "@components/ButtonIcon";
import { Filter } from "@components/Filter";
import { Input } from "@components/Input";
import { PlayerCard } from '@components/PlayerCard';
import { ListEmpty } from '@components/ListEmpty';
import { Button } from '@components/Button';

import { Container, Form, HeaderList, NumberOfPlayers } from "./styles";
import { PlayerStorageDTO } from '@storage/player/PlayerStorageDTO';


type RouteParams = {
  group: string;
}

export function Players() {

  const [newPlayerName, setNewPlayerName] = useState('')
  const [team, setTeam] = useState('Time A');
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

  const route = useRoute()
  const navigation = useNavigation()

  const newPlayerNameInputRef = useRef<TextInput>(null)

  const { group } = route.params as RouteParams

  async function handleAddPlayer(){
    if(newPlayerName.trim().length === 0){
      return Alert.alert("Nova Pessoa", "Digite o nome do player")
    }

    const newPlayer = {
      name: newPlayerName,
      team
    }

    try{

      await playerAddByGroup(newPlayer, group)
      newPlayerNameInputRef.current?.blur()
      setNewPlayerName('')
      fetchPlayersByTeam()

 
      
    }catch(error){
      if(error instanceof AppError){
        Alert.alert("Nova pessoa", error.message)
      }
      else{
        console.log(error)
        Alert.alert("Nova pessa", "Não foi possível cadastrar usuário")
        console.log(error)
      }
    }

  }

  async function fetchPlayersByTeam(){
    try {
          const playersByTeam = await playerGetByGroupAndTeam(group,team)
          setPlayers(playersByTeam)
        } catch (error) {
          console.log(error);
          Alert.alert("Pessoas", "Não foi possível carregar os jogadores")
        }
  }


  async function handlePlayerRemove(playerName:string){
    try {
      await playerRemoveByGroup(playerName, group)
      fetchPlayersByTeam()
    } catch (error) {
      console.log(error)
      Alert.alert("Remoção de pessoa", "Não foi possível remover o jogador")
    }
  }

  async function groupRemove(){
    try {
      
      await groupDeleteByName(group)
      navigation.navigate('groups')

    } catch (error) {
      console.log(error)
      Alert.alert("Remoção de grupo", "Não foi possível remover o grupo")
    }
  }

  async function handleGroupRemove(){
    Alert.alert(
      "Remover",
      'Deseja remover o grupo?',
      [
        {text: 'Não', style: 'cancel'},
        {text: 'Sim', onPress: () => groupRemove()}
      ]
    )
  }



  useEffect(()=>{
    fetchPlayersByTeam()

  },[team])

  return (
    <Container>
      <Header showBackButton />

      <Highlight 
        title={group}
        subtitle="adicione a galera e separe os times"
      />

      <Form>
        <Input
          inputRef = {newPlayerNameInputRef} 
          placeholder="Nome da pessoa"
          autoCorrect={false}
          onChangeText = {setNewPlayerName}
          value={newPlayerName}
          onSubmitEditing={handleAddPlayer}
          returnKeyType="done"
        />

        <ButtonIcon 
          icon="add" 
          onPress={handleAddPlayer}
        />
      </Form>

      <HeaderList>
        <FlatList 
          data={['Time A', 'Time B']}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <Filter 
              title={item}
              isActive={item === team}
              onPress={() => setTeam(item)}
            />
          )}
          horizontal
        />


        <NumberOfPlayers>
          {players.length}
        </NumberOfPlayers>
      </HeaderList>

      <FlatList 
        data={players}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <PlayerCard 
            name={item.name} 
            onRemove={() => handlePlayerRemove(item.name)}
          />
        )}
        ListEmptyComponent={() => (
          <ListEmpty message="Não há pessoas nesse time" />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: 100 }, players.length === 0 && { flex: 1 }]}
      />

      <Button 
        title="Remover Turma"
        type="SECONDARY"
        onPress={handleGroupRemove}
      />
    </Container>
  )
}