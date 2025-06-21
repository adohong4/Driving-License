export default function FormInput({ label, name, value, onChange, placeholder, type = "text" }) {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 font-semibold">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={placeholder}
            />
        </div>
    );
}