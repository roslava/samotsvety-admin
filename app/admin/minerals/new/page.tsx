import MineralForm from '../components/MineralForm';

export default function NewMineralPage() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-4xl font-bold">Новая карточка камня</h1>
      <MineralForm />
    </div>
  );
}
