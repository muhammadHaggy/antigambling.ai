import CharacterCard from './CharacterCard';

interface Character {
  id: string;
  name: string;
  creator: string;
  description: string;
  image: string;
  interactions: number;
}

interface CharacterSectionProps {
  title: string;
  characters: Character[];
}

export default function CharacterSection({ title, characters }: CharacterSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            id={character.id}
            name={character.name}
            creator={character.creator}
            description={character.description}
            image={character.image}
            interactions={character.interactions}
          />
        ))}
      </div>
    </section>
  );
} 