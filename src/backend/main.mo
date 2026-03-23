import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";

actor {
  type Entry = {
    date : Time.Time;
    game : Text;
    party : Text;
    numbers : [Nat];
    bSection : [Nat];
    aSection : [Nat];
    cuttingType : Int;
    cuttingAmount : Nat;
    cuttingPercentage : Nat;
    multiplyValue : Nat;
  };

  let entries = Map.empty<Text, Entry>();

  public shared ({ caller }) func saveData(
    date : Time.Time,
    game : Text,
    party : Text,
    numbers : [Nat],
    bSection : [Nat],
    aSection : [Nat],
    cuttingType : Int,
    cuttingAmount : Nat,
    cuttingPercentage : Nat,
    multiplyValue : Nat,
  ) : async () {
    let key = date.toText() # game # party;
    let entry : Entry = {
      date;
      game;
      party;
      numbers;
      bSection;
      aSection;
      cuttingType;
      cuttingAmount;
      cuttingPercentage;
      multiplyValue;
    };
    entries.add(key, entry);
  };

  public shared ({ caller }) func deleteData(
    date : Time.Time,
    game : Text,
    party : Text,
  ) : async () {
    let key = date.toText() # game # party;
    entries.remove(key); // Use remove which returns ().
  };

  public query ({ caller }) func getDataByDate(date : Time.Time) : async [Entry] {
    entries.values().toArray().filter(
      func(entry) { entry.date == date }
    );
  };

  public query ({ caller }) func getDataByParty(party : Text) : async [Entry] {
    entries.values().toArray().filter(
      func(entry) { entry.party == party }
    );
  };

  public query ({ caller }) func getAllData() : async [Entry] {
    entries.values().toArray();
  };
};
